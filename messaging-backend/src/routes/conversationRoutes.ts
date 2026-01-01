import express from 'express';
import { authenticate } from '../middleware/auth';
import {
  createConversation,
  getConversations,
  getConversationById,
} from '../controllers/conversationControllers';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Create a new conversation
router.post('/', createConversation);

// Get all conversations for the user
router.get('/', getConversations);

// Get a specific conversation by ID
router.get('/:conversationId', getConversationById);

export default router;