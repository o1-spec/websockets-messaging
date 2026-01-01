import { Response } from 'express';
import Message from '../models/Message';
import Conversation from '../models/Conversation';
import Notification from '../models/Notification';
import { AuthRequest } from '../middleware/auth';

// Send a message
export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { conversationId, content, messageType = 'text', fileUrl } = req.body;
    const senderId = req.user?.id;

    if (!conversationId || !content) {
      return res.status(400).json({ message: 'Conversation ID and content are required' });
    }

    // Check if conversation exists and user is a participant
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    const isParticipant = conversation.participants.some(
      (p) => p.toString() === senderId
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
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get messages for a conversation
export const getMessages = async (req: AuthRequest, res: Response) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user?.id;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = parseInt(req.query.skip as string) || 0;

    // Check if user is a participant
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    const isParticipant = conversation.participants.some(
      (p) => p.toString() === userId
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
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Mark message as read
export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const { messageId } = req.params;
    const userId = req.user?.id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Add user to readBy array if not already there
    if (!message.readBy.includes(userId as any)) {
      message.readBy.push(userId as any);
      message.isRead = true;
      await message.save();
    }

    res.status(200).json({ message: 'Message marked as read' });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete message
export const deleteMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { messageId } = req.params;
    const userId = req.user?.id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Only sender can delete message
    if (message.sender.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await message.deleteOne();

    res.status(200).json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};