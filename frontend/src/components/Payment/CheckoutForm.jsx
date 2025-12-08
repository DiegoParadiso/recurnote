import React, { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@context/ThemeContext';

const CheckoutForm = () => {
    const stripe = useStripe();
    const elements = useElements();
    const { t } = useTranslation();
    const { isLightTheme } = useTheme();
    const [message, setMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsLoading(true);

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/payment/success`,
            },
        });

        if (error.type === "card_error" || error.type === "validation_error") {
            setMessage(error.message);
        } else {
            setMessage("An unexpected error occurred.");
        }

        setIsLoading(false);
    };

    return (
        <form id="payment-form" onSubmit={handleSubmit}>
            <PaymentElement id="payment-element" options={{
                layout: "tabs",
                theme: isLightTheme ? 'stripe' : 'night',
                variables: {
                    colorPrimary: '#000000',
                    colorBackground: isLightTheme ? '#ffffff' : '#1a1a1a',
                    colorText: isLightTheme ? '#30313d' : '#e0e0e0',
                    colorDanger: '#df1b41',
                    fontFamily: 'Inter, system-ui, sans-serif',
                    spacingUnit: '4px',
                    borderRadius: '8px',
                }
            }} />
            <button disabled={isLoading || !stripe || !elements} id="submit" className="pay-button">
                <span id="button-text">
                    {isLoading ? <div className="spinner" id="spinner"></div> : t('payment.payNow')}
                </span>
            </button>
            {message && <div id="payment-message">{message}</div>}

            <style jsx>{`
        #payment-form {
          width: 100%;
          min-width: 350px;
          align-self: center;
          box-shadow: 0px 0px 0px 0.5px rgba(50, 50, 93, 0.1),
            0px 2px 5px 0px rgba(50, 50, 93, 0.1), 0px 1px 1.5px 0px rgba(0, 0, 0, 0.07);
          border-radius: 7px;
          padding: 40px;
          background: var(--color-bg-2);
        }

        .pay-button {
          background: var(--color-text-primary);
          color: var(--color-bg);
          border-radius: 8px;
          border: 0;
          padding: 12px 16px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          display: block;
          transition: all 0.2s ease;
          box-shadow: 0px 4px 5.5px 0px rgba(0, 0, 0, 0.07);
          width: 100%;
          margin-top: 24px;
        }

        .pay-button:hover {
          filter: contrast(115%);
        }

        .pay-button:disabled {
          opacity: 0.5;
          cursor: default;
        }

        #payment-message {
          color: var(--color-text-secondary);
          font-size: 16px;
          line-height: 20px;
          padding-top: 12px;
          text-align: center;
        }
      `}</style>
        </form>
    );
};

export default CheckoutForm;
