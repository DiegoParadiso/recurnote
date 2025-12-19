import React, { useState, useEffect } from 'react';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import './PaymentPage.css';

const PaymentPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [planId, setPlanId] = useState(null);
  const [message, setMessage] = useState("");
  const { user, refreshMe } = useAuth(); // Asumiendo que existe un hook de auth

  // Get plan data from navigation state
  const planData = location.state || {
    planType: 'monthly',
    price: 3.99,
    currency: 'USD',
    interval: 'month'
  };

  useEffect(() => {
    const fetchPlanId = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5002'}/api/payment/get-plan`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            planType: planData.planType,
            price: planData.price,
            currency: planData.currency,
          }),
        });
        const data = await response.json();
        if (data.planId) {
          setPlanId(data.planId);
        } else {
          setMessage("Could not load subscription plan");
        }
      } catch (error) {
        console.error("Error fetching plan:", error);
        setMessage("Error loading plan details");
      }
    };

    fetchPlanId();
  }, [planData]);

  const initialOptions = {
    "client-id": import.meta.env.VITE_PAYPAL_CLIENT_ID,
    currency: planData.currency,
    intent: "subscription",
    vault: true
  };

  console.log('PayPal Options:', {
    ...initialOptions,
    "client-id": initialOptions["client-id"] ? `${initialOptions["client-id"].substring(0, 5)}...` : 'MISSING'
  });
  console.log('Plan ID:', planId);

  const createSubscription = (data, actions) => {
    return actions.subscription.create({
      'plan_id': planId
    });
  };

  const onApprove = async (data, actions) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5002'}/api/payment/activate-subscription`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscriptionId: data.subscriptionID,
          userId: user?.id
        }),
      });

      const result = await response.json();

      if (result.success) {
        setMessage("Subscription active! Redirecting...");
        await refreshMe();
        setTimeout(() => navigate('/'), 2000);
      } else {
        throw new Error(result.error || 'Activation failed');
      }
    } catch (error) {
      console.error("Error activating subscription:", error);
      setMessage(`Activation failed: ${error.message}`);
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
        <div className="selected-plan-info">
          <h2>{t('payment.selectedPlan')}</h2>
          <div className="plan-details">
            <p className="plan-name">
              {planData.planType === 'monthly' ? t('pricing.monthly') : t('pricing.annual')}
            </p>
            <p className="plan-price">
              {planData.currency === 'ARS' ? planData.price : `$${planData.price}`} {planData.currency}
              {' '}/{' '}
              {planData.planType === 'monthly' ? t('pricing.month') : t('pricing.year')}
            </p>
          </div>
          <div className="trial-info">
            <span className="trial-badge">{t('payment.freeTrial')}</span>
            <p className="trial-text">{t('payment.trialDescription')}</p>
          </div>
        </div>

        {planId ? (
          <PayPalScriptProvider options={initialOptions}>
            <PayPalButtons
              style={{ layout: "vertical", label: "subscribe" }}
              createSubscription={createSubscription}
              onApprove={onApprove}
            />
          </PayPalScriptProvider>
        ) : (
          <div className="loading-plan">{t('common.loading')}</div>
        )}

        {message && <div className="payment-message">{message}</div>}
      </div>
    </div>
  );
};

export default PaymentPage;
