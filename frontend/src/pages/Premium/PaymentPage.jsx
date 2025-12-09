import React, { useState } from 'react';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './PaymentPage.css';

const PaymentPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");

  const initialOptions = {
    "client-id": import.meta.env.VITE_PAYPAL_CLIENT_ID,
    currency: "USD",
    intent: "capture",
  };

  const createOrder = async (data, actions) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5002'}/api/payment/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [{ id: "premium-subscription" }],
        }),
      });
      const order = await response.json();
      return order.id;
    } catch (error) {
      console.error("Error creating order:", error);
      setMessage("Could not initiate PayPal checkout");
    }
  };

  const onApprove = async (data, actions) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5002'}/api/payment/capture-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderID: data.orderID
        }),
      });
      const orderData = await response.json();
      const errorDetail = orderData?.details?.[0];

      if (errorDetail?.issue === "INSTRUMENT_DECLINED") {
        return actions.restart();
      } else if (errorDetail) {
        throw new Error(`${errorDetail.description} (${orderData.debug_id})`);
      } else {
        setMessage("Payment successful!");
        setTimeout(() => navigate('/payment/success'), 1500);
      }
    } catch (error) {
      console.error("Error capturing order:", error);
      setMessage(`Transaction failed: ${error.message}`);
    }
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
        <PayPalScriptProvider options={initialOptions}>
          <PayPalButtons
            style={{ layout: "vertical" }}
            createOrder={createOrder}
            onApprove={onApprove}
          />
        </PayPalScriptProvider>
        {message && <div className="payment-message">{message}</div>}
      </div>
    </div>
  );
};

export default PaymentPage;
