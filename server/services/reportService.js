import db from '../config/db.js';
// Note: FinanceService logic for "Law of Receipts" might need updates if it relied on debt columns.
// For reports, we will calculate based on raw data references.

export class ReportService {
    static async getDelegateDebts(startDate, endDate) {
        // Calculate debts dynamically: Invoices - Payments for each delegate's customers
        const dateFilter = startDate && endDate
            ? `AND i."createdAt" BETWEEN '${startDate} 00:00:00' AND '${endDate} 23:59:59'`
            : '';

        const result = await db.query(`
            SELECT 
                d.id,
                d.name as "delegateName",
                COUNT(DISTINCT c.id) as "customerCount",
                (
                    COALESCE(SUM(i."cashAmount"), 0) - 
                    COALESCE((SELECT SUM(p.amount) FROM payments p WHERE p."customerId" IN (SELECT id FROM customers WHERE "delegateId" = d.id) AND p.method = 'CASH'), 0)
                ) as "totalCashDue",
                (
                    COALESCE(SUM(i."chequeAmount"), 0) - 
                    COALESCE((SELECT SUM(p.amount) FROM payments p WHERE p."customerId" IN (SELECT id FROM customers WHERE "delegateId" = d.id) AND (p.method = 'CHEQUE' OR p.method = 'BANK_TRANSFER')), 0)
                ) as "totalChequeDue",
                (
                    COALESCE(SUM(i."totalAmount"), 0) - 
                    COALESCE((SELECT SUM(p.amount) FROM payments p WHERE p."customerId" IN (SELECT id FROM customers WHERE "delegateId" = d.id)), 0)
                ) as "totalDue"
            FROM delegates d
            LEFT JOIN customers c ON d.id = c."delegateId"
            LEFT JOIN invoices i ON c.id = i."customerId"
            WHERE 1=1 ${dateFilter}
            GROUP BY d.id, d.name
            ORDER BY "totalDue" DESC
        `);
        return result.rows;
    }

    static async getDailyPerformance(startDate, endDate) {
        const today = new Date().toISOString().split('T')[0];
        const start = startDate || today;
        const end = endDate || today;

        const dateFilter = `"createdAt" BETWEEN '${start} 00:00:00' AND '${end} 23:59:59'`;

        const invoicesResult = await db.query(`
            SELECT i.*, c.name as "customerName" 
            FROM invoices i
            JOIN customers c ON i."customerId" = c.id
            WHERE i.${dateFilter}
            ORDER BY i."createdAt" DESC
        `);

        const paymentsResult = await db.query(`
            SELECT p.*, c.name as "customerName", i."invoiceNumber"
            FROM payments p
            JOIN customers c ON p."customerId" = c.id
            LEFT JOIN invoices i ON p."invoiceId" = i.id
            WHERE p.${dateFilter}
            ORDER BY p."createdAt" DESC
        `);

        return {
            startDate: start,
            endDate: end,
            invoices: invoicesResult.rows,
            payments: paymentsResult.rows,
            totals: {
                invoices_count: invoicesResult.rows.length,
                invoices_amount: invoicesResult.rows.reduce((sum, inv) => sum + Number(inv.totalAmount), 0), // checking if totalAmount is camelCase in result? Yes provided queries used quotes
                payments_count: paymentsResult.rows.length,
                payments_amount: paymentsResult.rows.reduce((sum, pay) => sum + Number(pay.amount), 0)
            }
        };
    }

    static async getStatementOfAccount(customerId, startDate, endDate) {
        const customerResult = await db.query('SELECT * FROM customers WHERE id = $1', [customerId]);
        const customer = customerResult.rows[0];

        if (!customer) throw new Error('Customer not found');

        const dateFilter = startDate && endDate
            ? `AND "createdAt" BETWEEN '${startDate} 00:00:00' AND '${endDate} 23:59:59'`
            : '';

        // 2. Get Chronological History
        const historyQuery = await db.query(`
            SELECT * FROM (
                SELECT 
                    'INVOICE' as type,
                    "invoiceNumber" as reference,
                    "createdAt",
                    "totalAmount" as amount,
                    "cashAmount" as "initialCash",
                    "chequeAmount" as "initialCheque",
                    "totalAmount" as delta,
                    status::text,
                    NULL as method,
                    NULL as "isException"
                FROM invoices WHERE "customerId" = $1 ${dateFilter}
                
                UNION ALL
                
                SELECT 
                    'PAYMENT' as type,
                    CASE WHEN "invoiceId" IS NOT NULL THEN method::text || ' (Linked)' ELSE method::text END as reference,
                    "createdAt",
                    amount as amount,
                    0 as "initialCash",
                    0 as "initialCheque",
                    -amount as delta,
                    CASE WHEN "isException" THEN 'EXCEPTION' ELSE 'NORMAL' END as status,
                    method::text,
                    "isException"
                FROM payments WHERE "customerId" = $1 ${dateFilter}
            ) data
            ORDER BY "createdAt" ASC
        `, [customerId]);

        // 3. Process Running Balances
        let runningCash = 0;
        let runningCheque = 0;
        let runningTotal = 0;

        const enrichedHistory = historyQuery.rows.map(item => {
            const amount = Number(item.amount);

            if (item.type === 'INVOICE') {
                const iCash = Number(item.initialCash);
                const iCheque = Number(item.initialCheque);
                runningCash += iCash;
                runningCheque += iCheque;
                runningTotal += amount;
            } else {
                // Determine what this payment paid off based on method
                // Simple logic: Cash pays Cash, Cheque pays Cheque
                // Any excess or cross-payment logic might be complex, keeping it simple as per likely intent
                if (item.method === 'CASH') {
                    runningCash -= amount;
                } else {
                    runningCheque -= amount;
                }
                runningTotal -= amount;
            }
            // Logic note: This keeps running split balances strictly by method. 
            // If "Cash" payment logic allows it to pay cheque debt, this needs to be smarter. 
            // But without FinanceService "Application" logic, this is the safest assumption for display.

            return {
                ...item,
                running_cash: runningCash,
                running_cheque: runningCheque,
                running_balance: runningTotal
            };
        });

        // 4. Current Balance (Calculated)
        // We can use the last running values or recalculate fresh from DB sum
        // Fresh sum is safer
        const balanceResult = await db.query(`
            SELECT 
                (
                    COALESCE((SELECT SUM("cashAmount") FROM invoices WHERE "customerId" = $1), 0) -
                    COALESCE((SELECT SUM(amount) FROM payments WHERE "customerId" = $1 AND method = 'CASH'), 0)
                ) as "cashDue",
                (
                    COALESCE((SELECT SUM("chequeAmount") FROM invoices WHERE "customerId" = $1), 0) -
                    COALESCE((SELECT SUM(amount) FROM payments WHERE "customerId" = $1 AND (method = 'CHEQUE' OR method = 'BANK_TRANSFER')), 0)
                ) as "chequeDue"
        `, [customerId]);

        return {
            customer,
            history: enrichedHistory,
            balance: {
                cash_due: Number(balanceResult.rows[0].cashDue || 0),
                cheque_due: Number(balanceResult.rows[0].chequeDue || 0),
                total_due: Number(balanceResult.rows[0].cashDue || 0) + Number(balanceResult.rows[0].chequeDue || 0)
            }
        };
    }
}
