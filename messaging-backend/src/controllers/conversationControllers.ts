import { Request, Response } from 'express';
import Conversation from '../models/Conversation';
import { IUser } from '../models/User';

interface AuthRequest extends Request {
  user?: IUser;
}

export const getConversations = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;

    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate('participants', 'username email isOnline avatar')
      .populate({
        path: 'lastMessage',
        populate: {
          path: 'sender',
          select: 'username',
        },
      })
      .sort({ updatedAt: -1 });

    res.json({ conversations });
  } catch (error: any) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const createConversation = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const { participantIds } = req.body;

    // Validate input
    if (!participantIds || !Array.isArray(participantIds) || participantIds.length === 0) {
      return res.status(400).json({ message: 'participantIds array is required' });
    }

    // Remove duplicates and ensure userId is included
    const allParticipants = Array.from(new Set([userId!.toString(), ...participantIds]));

    // Check if we have at least 2 participants
    if (allParticipants.length < 2) {
      return res.status(400).json({ message: 'At least 2 participants are required' });
    }

    // Check if conversation already exists
    const existingConversation = await Conversation.findOne({
      participants: { $all: allParticipants, $size: allParticipants.length },
      isGroup: false,
    }).populate('participants', 'username email isOnline avatar');

    if (existingConversation) {
      return res.json({ conversation: existingConversation });
    }

    // Create new conversation
    const conversation = new Conversation({
      participants: allParticipants,
      isGroup: allParticipants.length > 2,
    });

    await conversation.save();
    await conversation.populate('participants', 'username email isOnline avatar');

    res.status(201).json({ conversation });
  } catch (error: any) {
    console.error('Create conversation error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getConversationById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    const conversation = await Conversation.findOne({
      _id: id,
      participants: userId,
    }).populate('participants', 'username email isOnline avatar');

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    res.json({ conversation });
  } catch (error: any) {
    console.error('Get conversation error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};