import express from 'express';
import { getSubscriptionPlan, activateSubscription, getPaymentConfig, handlePaypalWebhook } from '../controllers/payment.controller.js';

const router = express.Router();

router.post('/get-plan', getSubscriptionPlan);
router.post('/activate-subscription', activateSubscription);
router.get('/config', getPaymentConfig);
router.post('/webhook/paypal', handlePaypalWebhook);

export default router;
