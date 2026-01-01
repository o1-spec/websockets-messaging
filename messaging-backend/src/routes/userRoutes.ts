import { Router } from 'express';
import {
  getUsers,
  getUserById,
  updateProfile,
  searchUsers,
  getOnlineUsers,
} from '../controllers/userController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All user routes require authentication
router.use(authenticate);

router.get('/', getUsers);
router.get('/search', searchUsers);
router.get('/online', getOnlineUsers);
router.get('/:userId', getUserById);
router.patch('/profile', updateProfile);

export default router;