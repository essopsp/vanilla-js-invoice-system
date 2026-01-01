import db from '../config/db.js';
import { nanoid } from 'nanoid';

export class CustomerService {
    static async getAll() {
        // Updated to use camelCase and dynamic balance calculation
        // Balance = Sum(Invoices) - Sum(Payments)
        // Note: usage of quote identifiers for camelCase columns
        const result = await db.query(`
            SELECT 
                c.*, 
                d.name as "delegateName",
                (
                    COALESCE((SELECT SUM("cashAmount") FROM invoices WHERE "customerId" = c.id), 0) -
                    COALESCE((SELECT SUM(amount) FROM payments WHERE "customerId" = c.id AND method = 'CASH'), 0)
                ) as "cashBalance",
                (
                    COALESCE((SELECT SUM("chequeAmount") FROM invoices WHERE "customerId" = c.id), 0) -
                    COALESCE((SELECT SUM(amount) FROM payments WHERE "customerId" = c.id AND (method = 'CHEQUE' OR method = 'BANK_TRANSFER')), 0)
                ) as "chequeBalance",
                (
                    COALESCE((SELECT SUM("totalAmount") FROM invoices WHERE "customerId" = c.id), 0) -
                    COALESCE((SELECT SUM(amount) FROM payments WHERE "customerId" = c.id), 0)
                ) as "totalBalance"
            FROM customers c 
            LEFT JOIN delegates d ON c."delegateId" = d.id 
            ORDER BY c.name ASC
        `);
        return result.rows;
    }

    static async getById(id) {
        const result = await db.query('SELECT * FROM customers WHERE id = $1', [id]);
        return result.rows[0];
    }

    static async create(data) {
        const { name, phone, notes, delegateId, created_by } = data;
        const id = nanoid();
        const userId = created_by || 'sys_1'; // Ensure valid user ID

        // Updated INSERT to match new schema columns
        const result = await db.query(
            `INSERT INTO customers (
                id, name, phone, notes, "delegateId", "userId"
            ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [id, name, phone, notes, delegateId, userId]
        );
        return result.rows[0];
    }
}
