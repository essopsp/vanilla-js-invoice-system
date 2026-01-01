import express from 'express';
import { createPayment, getPayments } from '../controllers/paymentController.js';

const router = express.Router();

router.get('/', getPayments);
router.post('/', createPayment);

export default router;
