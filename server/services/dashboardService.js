import db from '../config/db.js';

export class DashboardService {
    static async getStats() {
        // 1. Total Debt Split (Calculated dynamically)
        // Cash Due = Sum(Invoice Cash) - Sum(Cash Payments)
        // Cheque Due = Sum(Invoice Cheque) - Sum(Cheque/Bank Payments)
        const debtResult = await db.query(`
            SELECT 
                (
                    COALESCE((SELECT SUM("cashAmount") FROM invoices), 0) -
                    COALESCE((SELECT SUM(amount) FROM payments WHERE method = 'CASH'), 0)
                ) as "totalCashDebt",
                (
                    COALESCE((SELECT SUM("chequeAmount") FROM invoices), 0) -
                    COALESCE((SELECT SUM(amount) FROM payments WHERE method = 'CHEQUE' OR method = 'BANK_TRANSFER'), 0)
                ) as "totalChequeDebt",
                COALESCE((SELECT SUM("totalAmount") FROM invoices), 0) as "totalInvoiceVolume"
        `);

        // 2. Active Customers (count)
        const customerCount = await db.query('SELECT COUNT(*) FROM customers');

        // 3. Recent Activity (Latest 5 payments)
        const recentPayments = await db.query(`
            SELECT p.*, c.name as "customerName" 
            FROM payments p 
            JOIN customers c ON p."customerId" = c.id 
            ORDER BY p."createdAt" DESC 
            LIMIT 5
        `);

        return {
            stats: debtResult.rows[0],
            customerCount: parseInt(customerCount.rows[0].count),
            recentActivity: recentPayments.rows
        };
    }
}
