import { Router } from 'express';
import {
  sendMessage,
  getMessages,
  markAsRead,
  deleteMessage,
} from '../controllers/messageController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All message routes require authentication
router.use(authenticate);

router.post('/send', sendMessage);
router.get('/conversation/:conversationId', getMessages);
router.patch('/:messageId/read', markAsRead);
router.delete('/:messageId', deleteMessage);

export default router;