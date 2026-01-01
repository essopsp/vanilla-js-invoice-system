import { ReportService } from '../services/reportService.js';

export const getCustomerSOA = async (req, res) => {
    try {
        const { id } = req.params;
        const { startDate, endDate } = req.query;
        const soa = await ReportService.getStatementOfAccount(id, startDate, endDate);
        res.json(soa);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getDelegateDebts = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const data = await ReportService.getDelegateDebts(startDate, endDate);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getDailyPerformance = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const data = await ReportService.getDailyPerformance(startDate, endDate);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
