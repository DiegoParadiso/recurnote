import paypal from '@paypal/checkout-server-sdk';
import dotenv from 'dotenv';
import { User } from '../models/user.model.js';

dotenv.config();

// Configurar entorno de PayPal para SDK (Legacy)
const environment = process.env.PAYPAL_MODE === 'live'
    ? new paypal.core.LiveEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET)
    : new paypal.core.SandboxEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET);
const client = new paypal.core.PayPalHttpClient(environment);

// Base URL para API REST de PayPal
const PAYPAL_API = process.env.PAYPAL_MODE === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';

// Helper para obtener Access Token
const getAccessToken = async () => {
    if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
        throw new Error('Missing PayPal credentials');
    }

    const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64');
    const response = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
        method: 'POST',
        body: 'grant_type=client_credentials',
        headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    });

    const data = await response.json();

    if (!response.ok) {
        console.error('PayPal Auth Error:', data);
        throw new Error(`Failed to get access token: ${data.error_description || data.error}`);
    }

    return data.access_token;
};

// Helper para crear/obtener Producto
const getOrCreateProduct = async (accessToken) => {
    const productId = 'RECURNOTE_PREMIUM_V1';

    // Intentar obtener producto existente
    try {
        const response = await fetch(`${PAYPAL_API}/v1/catalogs/products/${productId}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) return productId;
    } catch (e) {
        console.log('Product check failed, attempting creation...');
    }

    // Crear producto si no existe
    const createResponse = await fetch(`${PAYPAL_API}/v1/catalogs/products`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id: productId,
            name: 'RecurNote Premium',
            description: 'Premium subscription for RecurNote',
            type: 'SERVICE',
            category: 'SOFTWARE',
        })
    });

    if (!createResponse.ok) {
        const errorData = await createResponse.json();

        // Si el error es porque ya existe, simplemente retornamos el ID
        const isDuplicate = errorData.details?.some(detail => detail.issue === 'DUPLICATE_RESOURCE_IDENTIFIER');
        if (createResponse.status === 422 && isDuplicate) {
            console.log('Product already exists (DUPLICATE_RESOURCE_IDENTIFIER), using existing ID.');
            return productId;
        }

        console.error('PayPal Product Creation Error:', errorData);
        throw new Error('Failed to create PayPal product');
    }

    return productId;
};

// Helper para crear Plan
const createPlan = async (accessToken, productId, planData) => {
    const { name, price, currency, interval } = planData;

    const response = await fetch(`${PAYPAL_API}/v1/billing/plans`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            product_id: productId,
            name: name,
            description: `${name} with 7-day free trial`,
            status: 'ACTIVE',
            billing_cycles: [
                {
                    frequency: {
                        interval_unit: interval === 'year' ? 'YEAR' : 'MONTH',
                        interval_count: 1
                    },
                    tenure_type: 'TRIAL',
                    sequence: 1,
                    total_cycles: 1,
                    pricing_scheme: {
                        fixed_price: {
                            value: '0',
                            currency_code: currency
                        }
                    }
                },
                {
                    frequency: {
                        interval_unit: interval === 'year' ? 'YEAR' : 'MONTH',
                        interval_count: 1
                    },
                    tenure_type: 'REGULAR',
                    sequence: 2,
                    total_cycles: 0, // 0 = infinito
                    pricing_scheme: {
                        fixed_price: {
                            value: price.toString(),
                            currency_code: currency
                        }
                    }
                }
            ],
            payment_preferences: {
                auto_bill_outstanding: true,
                setup_fee: {
                    value: '0',
                    currency_code: currency
                },
                setup_fee_failure_action: 'CONTINUE',
                payment_failure_threshold: 3
            }
        })
    });

    const data = await response.json();

    if (!response.ok) {
        console.error('PayPal Plan Creation Error:', data);
        throw new Error(`Failed to create plan: ${data.name} - ${data.message}`);
    }

    return data.id;
};

// Cache simple para plan IDs en memoria
const planCache = {};

export const getSubscriptionPlan = async (req, res) => {
    const { planType, price, currency } = req.body;
    const cacheKey = `${planType}_${currency}_${price}`;

    if (planCache[cacheKey]) {
        return res.json({ planId: planCache[cacheKey] });
    }

    try {
        const accessToken = await getAccessToken();
        const productId = await getOrCreateProduct(accessToken);

        // Buscar planes existentes (simplificado: creamos uno nuevo si no está en caché)
        // En producción idealmente buscarías en la lista de planes de PayPal

        const planId = await createPlan(accessToken, productId, {
            name: `RecurNote Premium ${planType} (${currency})`,
            price: price,
            currency: currency,
            interval: planType === 'annual' ? 'year' : 'month'
        });

        planCache[cacheKey] = planId;
        res.json({ planId });

    } catch (error) {
        console.error('Error getting subscription plan:', error);
        res.status(500).json({ error: error.message });
    }
};

export const activateSubscription = async (req, res) => {
    const { subscriptionId, userId } = req.body;

    try {
        // Verificar estado de la suscripción
        const accessToken = await getAccessToken();
        const response = await fetch(`${PAYPAL_API}/v1/billing/subscriptions/${subscriptionId}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        const subscription = await response.json();

        if (subscription.status === 'ACTIVE' || subscription.status === 'APPROVAL_PENDING') {
            // Actualizar usuario a VIP
            await User.update(
                { is_vip: true },
                { where: { id: userId } }
            );

            res.json({ success: true, status: subscription.status });
        } else {
            res.status(400).json({ error: 'Subscription not active' });
        }

    } catch (error) {
        console.error('Error activating subscription:', error);
        res.status(500).json({ error: error.message });
    }
};

// Mantener compatibilidad con rutas anteriores si es necesario, o eliminar
export const createOrder = async (req, res) => {
    res.status(410).json({ error: 'Use subscription flow instead' });
};

export const captureOrder = async (req, res) => {
    res.status(410).json({ error: 'Use subscription flow instead' });
};
