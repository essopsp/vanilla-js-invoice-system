import db from '../config/db.js';
import { nanoid } from 'nanoid';

export class DelegateService {
    static async getAll() {
        const result = await db.query('SELECT * FROM delegates ORDER BY name ASC');
        return result.rows;
    }

    static async create(data) {
        const { name, phone, role } = data;
        const id = nanoid();
        const result = await db.query(
            'INSERT INTO delegates (id, name, phone, role) VALUES ($1, $2, $3, $4) RETURNING *',
            [id, name, phone, role || 'SALES']
        );
        return result.rows[0];
    }

    static async delete(id) {
        const result = await db.query('DELETE FROM delegates WHERE id = $1 RETURNING *', [id]);
        return result.rows[0];
    }
}
