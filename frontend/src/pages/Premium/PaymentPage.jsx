import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from '@components/Payment/CheckoutForm';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@context/ThemeContext';

// Make sure to call loadStripe outside of a component’s render to avoid
// recreating the Stripe object on every render.
// This is your test publishable API key.
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

const PaymentPage = () => {
    const [clientSecret, setClientSecret] = useState("");
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { isLightTheme } = useTheme();

    useEffect(() => {
        // Create PaymentIntent as soon as the page loads
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5002'}/api/payment/create-payment-intent`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items: [{ id: "premium-subscription" }], amount: 1000 }), // $10.00
        })
            .then((res) => res.json())
            .then((data) => setClientSecret(data.clientSecret));
    }, []);

    const appearance = {
        theme: isLightTheme ? 'stripe' : 'night',
        variables: {
            colorPrimary: '#000000',
        },
    };
    const options = {
        clientSecret,
        appearance,
    };

    return (
        <div className="payment-page">
            <div className="payment-header">
                <button onClick={() => navigate(-1)} className="back-button">
                    <ArrowLeft size={24} />
                </button>
                <h1>{t('payment.title')}</h1>
            </div>

            <div className="payment-content">
                {clientSecret && (
                    <Elements options={options} stripe={stripePromise}>
                        <CheckoutForm />
                    </Elements>
                )}
            </div>

            <style jsx>{`
        .payment-page {
          min-height: 100vh;
          background: var(--color-bg);
          color: var(--color-text-primary);
          padding: 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .payment-header {
          width: 100%;
          max-width: 800px;
          display: flex;
          align-items: center;
          margin-bottom: 3rem;
          position: relative;
        }

        .back-button {
          background: none;
          border: none;
          color: var(--color-text-primary);
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 50%;
          transition: background 0.2s;
          position: absolute;
          left: 0;
        }

        .back-button:hover {
          background: var(--color-bg-2);
        }

        .payment-header h1 {
          flex: 1;
          text-align: center;
          font-size: 1.5rem;
          font-weight: 600;
          margin: 0;
        }

        .payment-content {
          width: 100%;
          max-width: 500px;
        }
      `}</style>
        </div>
    );
};

export default PaymentPage;
