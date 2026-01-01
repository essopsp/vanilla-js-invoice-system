import db from '../config/db.js';
import { nanoid } from 'nanoid';
import { FinanceService } from './financeService.js';

export class InvoiceService {
    static async create(data) {
        const { customerId, totalAmount, created_by, invoiceDate, notes } = data;

        const { cashDebt, chequeDebt } = FinanceService.calculateInvoiceSplit(totalAmount);

        // Generate Invoice Number
        const lastInvoice = await db.query(`
            SELECT "invoiceNumber" 
            FROM invoices 
            WHERE "invoiceNumber" LIKE 'INV-%' 
            ORDER BY "createdAt" DESC 
            LIMIT 1
        `);

        let nextId = 1;
        if (lastInvoice.rows.length > 0) {
            const lastNum = lastInvoice.rows[0].invoiceNumber.split('-')[1];
            nextId = parseInt(lastNum) + 1;
        }
        const invoiceNumber = `INV-${nextId.toString().padStart(6, '0')}`;

        const id = nanoid();
        const userId = created_by || 'sys_1';

        const result = await db.query(
            `INSERT INTO invoices (
                id, "invoiceNumber", "customerId", "totalAmount", 
                "cashAmount", "chequeAmount", "invoiceDate", notes,
                "userId", status
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
            [
                id, invoiceNumber, customerId, totalAmount,
                cashDebt, chequeDebt,
                invoiceDate || new Date(), notes,
                userId, 'UNPAID'
            ]
        );
        return result.rows[0];
    }

    static async getByCustomerId(customerId) {
        // Updated to include dynamic remaining balance calculation
        const result = await db.query(`
            SELECT 
                i.*,
                (i."cashAmount" - COALESCE((SELECT SUM(amount) FROM payments WHERE "invoiceId" = i.id AND method = 'CASH'), 0)) as "remainingCashDebt",
                (i."chequeAmount" - COALESCE((SELECT SUM(amount) FROM payments WHERE "invoiceId" = i.id AND (method = 'CHEQUE' OR method = 'BANK_TRANSFER')), 0)) as "remainingChequeDebt"
            FROM invoices i
            WHERE "customerId" = $1 
            ORDER BY "createdAt" DESC
        `, [customerId]);
        return result.rows;
    }

    static async getAll() {
        // Updated to include dynamic remaining balance calculation
        const result = await db.query(`
            SELECT 
                i.*, 
                c.name as "customerName",
                (i."cashAmount" - COALESCE((SELECT SUM(amount) FROM payments WHERE "invoiceId" = i.id AND method = 'CASH'), 0)) as "remainingCashDebt",
                (i."chequeAmount" - COALESCE((SELECT SUM(amount) FROM payments WHERE "invoiceId" = i.id AND (method = 'CHEQUE' OR method = 'BANK_TRANSFER')), 0)) as "remainingChequeDebt"
            FROM invoices i 
            JOIN customers c ON i."customerId" = c.id 
            ORDER BY i."createdAt" DESC
        `);
        return result.rows;
    }
}
