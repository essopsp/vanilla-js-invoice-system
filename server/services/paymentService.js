import db from '../config/db.js';
import { nanoid } from 'nanoid';

export class PaymentService {
    /**
     * Creates a payment and applies it to debt.
     * Uses a transaction to ensure atomic updates.
     */
    static async create(data) {
        const client = await db.getClient();

        try {
            await client.query('BEGIN');

            const {
                customerId, invoiceId, amount, method,
                isException, bankName, notes, userId
            } = data;

            // Normalize ID if needed, or rely on db default if we remove this. 
            // Schema has default cuid(), but standard here is nanoid usually. sticking to nanoid as per previous code style or letting db handle it?
            // Previous code used nanoid(). Schema has @default(cuid()). 
            // To match schema exactly we should arguably let DB generate it, but returning * works.
            // Let's use nanoid to start or rely on DB default? 
            // Prisma @default(cuid()) means DB generates it if not provided? 
            // In pure SQL with strict schema, usually we provide ID or let default handler work.
            // The provided schema has `id String @id @default(cuid())`. 
            // However, the SQL schema I wrote has `id TEXT PRIMARY KEY` but NO DEFAULT logic in SQL (Postgres doesn't have cuid built-in).
            // So I MUST generate ID in application or add extension. Safe bet: generate CUID or nanoid here.
            // I'll stick to nanoid for now as it was there.
            const paymentId = nanoid();

            // 1. Record the payment
            // Note: Schema uses "quoted" camelCase columns
            const paymentResult = await client.query(
                `INSERT INTO payments (
                    id, "customerId", "invoiceId", amount, method, 
                    "isException", "bankName", notes, "userId",
                    "createdAt", "updatedAt"
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
                [
                    paymentId, customerId, invoiceId, amount, method,
                    isException || false, bankName, notes, userId,
                    new Date(), new Date()
                ]
            );

            // 2. If linked to an invoice, verify and update status
            // Note: We need to implement the "Law of Receipts" logic but adapted for new columns.
            // However, the user schema REMOVED `remaining_cash_debt` columns from Invoice model in Prisma!
            // Wait, looking at User Request schema:
            // model Invoice { ... totalAmount Float, cashAmount Float, chequeAmount Float ... status InvoiceStatus ... }
            // IT DOES NOT HAVE remainingCashDebt.
            // This means we cannot simply decrement a column. We must verify if the sum of payments >= total.
            // OR... maybe I missed something in schema?
            // "invoices  Invoice[]", "payments  Payment[]".
            // It seems "remaining debt" is now dynamic.

            // Checking if I shoud update status?
            if (invoiceId) {
                // Determine status based on all payments for this invoice
                const paymentsSum = await client.query(
                    `SELECT SUM(amount) as total_paid FROM payments WHERE "invoiceId" = $1`,
                    [invoiceId]
                );
                const totalPaid = Number(paymentsSum.rows[0].total_paid || 0);

                const invoiceRes = await client.query(
                    `SELECT "totalAmount" FROM invoices WHERE id = $1`,
                    [invoiceId]
                );
                const totalAmount = Number(invoiceRes.rows[0].totalAmount);

                let newStatus = 'UNPAID';
                if (totalPaid >= totalAmount) {
                    newStatus = 'PAID';
                } else if (totalPaid > 0) {
                    newStatus = 'PARTIALLY_PAID';
                }

                await client.query(
                    `UPDATE invoices SET status = $1 WHERE id = $2`,
                    [newStatus, invoiceId]
                );
            }

            // 3. Customer Balance is now dynamic, no need to update customer table.

            await client.query('COMMIT');
            return paymentResult.rows[0];

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    static async getAll() {
        // Updated to use camelCase and JOINs correctly
        const result = await db.query(`
            SELECT p.*, c.name as "customerName", i."invoiceNumber" 
            FROM payments p 
            JOIN customers c ON p."customerId" = c.id 
            LEFT JOIN invoices i ON p."invoiceId" = i.id 
            ORDER BY p."createdAt" DESC
        `);
        return result.rows;
    }
}
