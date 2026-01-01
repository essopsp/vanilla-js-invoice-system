import express from 'express';
import { getDelegates, createDelegate, deleteDelegate } from '../controllers/delegateController.js';

const router = express.Router();

router.get('/', getDelegates);
router.post('/', createDelegate);
router.delete('/:id', deleteDelegate);

export default router;
