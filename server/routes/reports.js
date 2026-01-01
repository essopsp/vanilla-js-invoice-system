import express from 'express';
import { getCustomerSOA, getDelegateDebts, getDailyPerformance } from '../controllers/reportController.js';

const router = express.Router();

router.get('/soa/:id', getCustomerSOA);
router.get('/delegate-debts', getDelegateDebts);
router.get('/daily-performance', getDailyPerformance);

export default router;
