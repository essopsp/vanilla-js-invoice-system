import { PaymentService } from '../services/paymentService.js';

export const getPayments = async (req, res) => {
    try {
        const payments = await PaymentService.getAll();
        res.json(payments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const createPayment = async (req, res) => {
    try {
        const payment = await PaymentService.create({
            ...req.body,
            userId: req.user?.id || 'sys_1' // Updated to match schema camelCase
        });
        res.status(201).json(payment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
