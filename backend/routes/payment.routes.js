import express from 'express';
import { getSubscriptionPlan, activateSubscription } from '../controllers/payment.controller.js';

const router = express.Router();

router.post('/get-plan', getSubscriptionPlan);
router.post('/activate-subscription', activateSubscription);

export default router;
