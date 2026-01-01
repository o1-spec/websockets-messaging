import { Response } from 'express';
import Conversation from '../models/Conversation';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';
import mongoose from 'mongoose';

export const createConversation = async (req: AuthRequest, res: Response) => {
  try {
    const { participantIds } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const userObject = req.user;
    console.log('Create conversation:', { userId, participantIds, userObject });

    if (!participantIds || !Array.isArray(participantIds) || participantIds.length === 0) {
      return res.status(400).json({ message: 'Participant IDs are required' });
    }

    // Validate all participant IDs
    for (const id of participantIds) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: `Invalid participant ID: ${id}` });
      }
    }

    // Include current user in participants
    const allParticipants = [userId.toString(), ...participantIds];
    console.log('All participants:', allParticipants);

    // Check if conversation already exists (for direct messages)
    if (participantIds.length === 1) {
      const existingConversation = await Conversation.findOne({
        isGroup: false,
        participants: { 
          $all: allParticipants,
          $size: 2 
        },
      }).populate('participants', '_id username email avatar isOnline');

      if (existingConversation) {
        console.log('Existing conversation found:', existingConversation._id);
        return res.status(200).json({
          message: 'Conversation already exists',
          conversation: existingConversation,
          isNew: false,
        });
      }
    }

    // Create new conversation
    const conversation = await Conversation.create({
      participants: allParticipants,
      isGroup: participantIds.length > 1,
    });

    await conversation.populate('participants', '_id username email avatar isOnline');

    console.log('New conversation created:', conversation._id);

    res.status(201).json({
      message: 'Conversation created successfully',
      conversation,
      isNew: true,
    });
  } catch (error: any) {
    console.error('Create conversation error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getConversations = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    console.log('Fetching conversations for user:', userId);

    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate('participants', '_id username email avatar isOnline')
      .populate({
        path: 'lastMessage',
        populate: {
          path: 'sender',
          select: 'username avatar',
        },
      })
      .sort({ updatedAt: -1 });

    res.status(200).json({ conversations });
  } catch (error: any) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getConversationById = async (req: AuthRequest, res: Response) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    if (!conversationId || !mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({ message: 'Invalid conversation ID' });
    }

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
    }).populate('participants', '_id username email avatar isOnline');

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    res.status(200).json({ conversation });
  } catch (error: any) {
    console.error('Get conversation error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};