import { DelegateService } from '../services/delegateService.js';

export const getDelegates = async (req, res) => {
    try {
        const delegates = await DelegateService.getAll();
        res.json(delegates);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}; export const createDelegate = async (req, res) => {
    try {
        const delegate = await DelegateService.create(req.body);
        res.status(201).json(delegate);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteDelegate = async (req, res) => {
    try {
        const { id } = req.params;
        await DelegateService.delete(id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
