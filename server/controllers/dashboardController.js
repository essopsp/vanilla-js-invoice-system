import { DashboardService } from '../services/dashboardService.js';

export const getDashboardStats = async (req, res) => {
    try {
        const stats = await DashboardService.getStats();
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
