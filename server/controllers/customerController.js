import { CustomerService } from '../services/customerService.js';

export const getCustomers = async (req, res) => {
    try {
        const customers = await CustomerService.getAll();
        res.json(customers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const createCustomer = async (req, res) => {
    try {
        // created_by should come from auth middleware
        const customer = await CustomerService.create({
            ...req.body,
            created_by: req.user?.id || 1
        });
        res.status(201).json(customer);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
