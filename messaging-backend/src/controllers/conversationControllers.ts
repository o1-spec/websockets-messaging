import { Response } from 'express';
import Conversation from '../models/Conversation';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/auth';

export const getConversations = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    console.log('Fetching conversations for user:', userId.toString());

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

    // Check authentication
    if (!userId) {
      console.error('User not authenticated - userId is undefined');
      return res.status(401).json({ message: 'User not authenticated' });
    }

    console.log('Create conversation:', {
      userId: userId.toString(),
      participantIds,
      userObject: req.user,
    });

    // Validate input
    if (!participantIds || !Array.isArray(participantIds) || participantIds.length === 0) {
      return res.status(400).json({ message: 'participantIds array is required' });
    }

    // Validate participant IDs
    const validParticipantIds = participantIds.filter((id: any) => 
      id && mongoose.Types.ObjectId.isValid(id)
    );

    if (validParticipantIds.length !== participantIds.length) {
      return res.status(400).json({ message: 'Invalid participant IDs' });
    }

    // Remove duplicates and ensure userId is included
    const allParticipants = Array.from(
      new Set([userId.toString(), ...validParticipantIds])
    );

    console.log('All participants:', allParticipants);

    // Check if we have at least 2 participants
    if (allParticipants.length < 2) {
      return res.status(400).json({ message: 'At least 2 participants are required' });
    }

    // Check if conversation already exists (for 1-on-1)
    if (allParticipants.length === 2) {
      const existingConversation = await Conversation.findOne({
        participants: { $all: allParticipants, $size: 2 },
        isGroup: false,
      }).populate('participants', 'username email isOnline avatar');

      if (existingConversation) {
        console.log('Existing conversation found:', existingConversation._id);
        return res.json({ conversation: existingConversation });
      }
    }

    // Create new conversation
    const conversation = new Conversation({
      participants: allParticipants,
      isGroup: allParticipants.length > 2,
    });

    await conversation.save();
    await conversation.populate('participants', 'username email isOnline avatar');

    console.log('New conversation created:', conversation._id);
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

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid conversation ID' });
    }

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