import { InvoiceService } from '../services/invoiceService.js';

export const getInvoices = async (req, res) => {
    try {
        const { customer_id } = req.query;
        let invoices;
        if (customer_id) {
            invoices = await InvoiceService.getByCustomerId(customer_id);
        } else {
            invoices = await InvoiceService.getAll();
        }
        res.json(invoices);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const createInvoice = async (req, res) => {
    try {
        const invoice = await InvoiceService.create({
            ...req.body,
            created_by: req.user?.id || 'sys_1'
        });
        res.status(201).json(invoice);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
