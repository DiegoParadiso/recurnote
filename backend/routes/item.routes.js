import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { getItems, createItem, updateItem, deleteItem } from '../controllers/item.controller.js';

const router = express.Router();

router.get('/', authMiddleware, getItems);
router.post('/', authMiddleware, createItem);
router.put('/:id', authMiddleware, updateItem);
router.delete('/:id', authMiddleware, deleteItem);

export default router;
