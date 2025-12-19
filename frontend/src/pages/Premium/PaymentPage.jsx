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
  const [paypalConfig, setPaypalConfig] = useState(null);

  // Get plan data from navigation state
  const planData = location.state || {
    planType: 'monthly',
    price: 3.99,
    currency: 'USD',
    interval: 'month'
  };

  useEffect(() => {
    const fetchConfigAndPlan = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5002';

        // 1. Fetch PayPal Configuration (Client ID)
        const configResponse = await fetch(`${apiUrl}/api/payment/config`);
        const configData = await configResponse.json();

        if (configData.clientId) {
          setPaypalConfig(configData);
        } else {
          setMessage("Could not load payment configuration");
          return;
        }

        // 2. Fetch Plan ID
        const planResponse = await fetch(`${apiUrl}/api/payment/get-plan`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            planType: planData.planType,
            price: planData.price,
            currency: planData.currency,
          }),
        });
        const planDataResponse = await planResponse.json();

        if (planDataResponse.planId) {
          setPlanId(planDataResponse.planId);
        } else {
          setMessage("Could not load subscription plan");
        }
      } catch (error) {
        console.error("Error initializing payment:", error);
        setMessage("Error loading payment details");
      }
    };

    fetchConfigAndPlan();
  }, [planData]);

  const initialOptions = {
    "client-id": paypalConfig?.clientId,
    currency: planData.currency,
    intent: "subscription",
    vault: true
  };

  if (!paypalConfig) {
    return <div className="payment-page"><div className="loading-plan">{t('common.loading')}</div></div>;
  }

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
