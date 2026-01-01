import express from 'express';
import { authenticate } from '../middleware/auth';
import { createConversation, getConversationById, getConversations } from '../controllers/conversationControllers';


const router = express.Router();

router.get('/', authenticate, getConversations);
router.post('/', authenticate, createConversation);
router.get('/:id', authenticate, getConversationById);

export default router;