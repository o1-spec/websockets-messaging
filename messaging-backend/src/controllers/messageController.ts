import { Response } from 'express';
import Message from '../models/Message';
import Conversation from '../models/Conversation';
import Notification from '../models/Notification';
import { AuthRequest } from '../middleware/auth';
import mongoose from 'mongoose';

// Send a message
export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { conversationId, content, messageType = 'text', fileUrl } = req.body;
    const senderId = req.user?._id;

    if (!senderId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    if (!conversationId || !content) {
      return res.status(400).json({ message: 'Conversation ID and content are required' });
    }

    // Validate conversation ID
    if (!conversationId || !mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({ message: 'Invalid conversation ID' });
    }

    // Check if conversation exists and user is a participant
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    const isParticipant = conversation.participants.some(
      (p) => p.toString() === senderId.toString()
    );
    if (!isParticipant) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Create message
    const message = await Message.create({
      conversationId,
      sender: senderId,
      content,
      messageType,
      fileUrl,
    });

    // Update conversation's last message
    conversation.lastMessage = message._id as any;
    await conversation.save();

    // Populate sender info
    await message.populate('sender', 'username avatar');

    res.status(201).json({ message });
  } catch (error: any) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get messages for a conversation
export const getMessages = async (req: AuthRequest, res: Response) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user?._id;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = parseInt(req.query.skip as string) || 0;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Validate conversation ID
    if (!conversationId || !mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({ message: 'Invalid conversation ID' });
    }

    // Check if user is a participant
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    const isParticipant = conversation.participants.some(
      (p) => p.toString() === userId.toString()
    );
    if (!isParticipant) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Get messages
    const messages = await Message.find({ conversationId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .populate('sender', 'username avatar');

    res.status(200).json({ messages: messages.reverse() });
  } catch (error: any) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Mark message as read
export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const { messageId } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Validate message ID
    if (!messageId || !mongoose.Types.ObjectId.isValid(messageId)) {
      return res.status(400).json({ message: 'Invalid message ID' });
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Add user to readBy array if not already there
    const userIdString = userId.toString();
    const isAlreadyRead = message.readBy.some(
      (id) => id.toString() === userIdString
    );

    if (!isAlreadyRead) {
      message.readBy.push(userId as any);
      message.isRead = true;
      await message.save();
    }

    res.status(200).json({ message: 'Message marked as read' });
  } catch (error: any) {
    console.error('Mark as read error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete message
export const deleteMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { messageId } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Validate message ID
    if (!messageId || !mongoose.Types.ObjectId.isValid(messageId)) {
      return res.status(400).json({ message: 'Invalid message ID' });
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Only sender can delete message
    if (message.sender.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await message.deleteOne();

    res.status(200).json({ message: 'Message deleted successfully' });
  } catch (error: any) {
    console.error('Delete message error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};