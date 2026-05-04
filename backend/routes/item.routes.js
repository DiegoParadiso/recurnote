import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { getItems, createItem, updateItem, deleteItem, syncItems } from '../controllers/item.controller.js';
import { validateRequest } from '../middleware/zodValidation.middleware.js';
import { createItemSchema, updateItemSchema, syncItemsSchema } from '../schemas/item.schema.js';

const router = express.Router();

router.get('/', authMiddleware, getItems);
router.post('/', authMiddleware, validateRequest(createItemSchema), createItem);
router.post('/sync', authMiddleware, validateRequest(syncItemsSchema), syncItems);
router.put('/:id', authMiddleware, validateRequest(updateItemSchema), updateItem);
router.delete('/:id', authMiddleware, deleteItem);

export default router;
