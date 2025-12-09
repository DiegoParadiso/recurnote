import paypal from '@paypal/checkout-server-sdk';
import dotenv from 'dotenv';

dotenv.config();

// Configurar entorno de PayPal
const environment = process.env.PAYPAL_MODE === 'live'
    ? new paypal.core.LiveEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET)
    : new paypal.core.SandboxEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET);
const client = new paypal.core.PayPalHttpClient(environment);

export const createOrder = async (req, res) => {
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
        intent: 'CAPTURE',
        purchase_units: [{
            amount: {
                currency_code: 'USD',
                value: '10.00'
            }
        }]
    });

    try {
        const order = await client.execute(request);
        res.json({ id: order.result.id });
    } catch (err) {
        console.error('Error creating PayPal order:', err);
        res.status(500).json({ error: err.message });
    }
};

export const captureOrder = async (req, res) => {
    const { orderID } = req.body;
    const request = new paypal.orders.OrdersCaptureRequest(orderID);
    request.requestBody({});

    try {
        const capture = await client.execute(request);
        res.json(capture.result);
    } catch (err) {
        console.error('Error capturing PayPal order:', err);
        res.status(500).json({ error: err.message });
    }
};
