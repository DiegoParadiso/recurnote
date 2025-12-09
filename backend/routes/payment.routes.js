import express from 'express';
import { createOrder, captureOrder } from '../controllers/payment.controller.js';

const router = express.Router();

router.post('/create-order', createOrder);
router.post('/capture-order', captureOrder);

export default router;
