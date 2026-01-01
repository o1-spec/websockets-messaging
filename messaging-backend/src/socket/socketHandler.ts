import { Server, Socket } from 'socket.io';
import Message from '../models/Message';
import Conversation from '../models/Conversation';
import Notification from '../models/Notification';
import User from '../models/User';
import { AuthenticatedSocket } from './socketAuth';

// Store online users
const onlineUsers = new Map<string, string>(); // userId -> socketId

export const handleSocketConnection = (io: Server) => {
  io.on('connection', async (socket: AuthenticatedSocket) => {
    const userId = socket.userId;
    const username = socket.username;

    if (!userId) {
      socket.disconnect();
      return;
    }

    console.log(`✅ User connected: ${username} (${userId})`);

    // Add user to online users
    onlineUsers.set(userId, socket.id);

    // Update user online status
    await User.findByIdAndUpdate(userId, { isOnline: true, lastSeen: new Date() });

    // Notify others that user is online
    socket.broadcast.emit('user:online', { userId, username });

    // Join user's personal room
    socket.join(userId);

    // Handle user joining a conversation
    socket.on('conversation:join', async (conversationId: string) => {
      try {
        const conversation = await Conversation.findById(conversationId);
        if (conversation && conversation.participants.some(p => p.toString() === userId)) {
          socket.join(`conversation:${conversationId}`);
          console.log(`User ${username} joined conversation ${conversationId}`);
        }
      } catch (error) {
        console.error('Error joining conversation:', error);
      }
    });

    // Handle user leaving a conversation
    socket.on('conversation:leave', (conversationId: string) => {
      socket.leave(`conversation:${conversationId}`);
      console.log(`User ${username} left conversation ${conversationId}`);
    });

    // Handle sending a message
    socket.on('message:send', async (data: {
      conversationId: string;
      content: string;
      messageType?: 'text' | 'image' | 'file' | 'video';
      fileUrl?: string;
    }) => {
      try {
        const { conversationId, content, messageType = 'text', fileUrl } = data;

        // Verify user is part of conversation
        const conversation = await Conversation.findById(conversationId);
        if (!conversation || !conversation.participants.some(p => p.toString() === userId)) {
          socket.emit('error', { message: 'Not authorized' });
          return;
        }

        // Create message
        const message = await Message.create({
          conversationId,
          sender: userId,
          content,
          messageType,
          fileUrl,
        });

        // Populate sender info
        await message.populate('sender', 'username avatar');

        // Update conversation's last message
        conversation.lastMessage = message._id as any;
        await conversation.save();

        // Emit message to conversation room
        io.to(`conversation:${conversationId}`).emit('message:receive', message);

        // Send notifications to offline participants
        const offlineParticipants = conversation.participants.filter(
          p => p.toString() !== userId && !onlineUsers.has(p.toString())
        );

        for (const participantId of offlineParticipants) {
          await Notification.create({
            recipient: participantId,
            sender: userId,
            type: 'message',
            title: 'New Message',
            message: `${username}: ${content.substring(0, 50)}${content.length > 50 ? '...' : ''}`,
            link: `/chat?conversation=${conversationId}`,
            metadata: { conversationId, messageId: message._id },
          });
        }

        console.log(`Message sent in conversation ${conversationId}`);
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicator
    socket.on('typing:start', (conversationId: string) => {
      socket.to(`conversation:${conversationId}`).emit('typing:user', {
        userId,
        username,
        conversationId,
      });
    });

    socket.on('typing:stop', (conversationId: string) => {
      socket.to(`conversation:${conversationId}`).emit('typing:stop', {
        userId,
        conversationId,
      });
    });

    // Handle message read
    socket.on('message:read', async (data: { messageId: string; conversationId: string }) => {
      try {
        const { messageId, conversationId } = data;

        const message = await Message.findById(messageId);
        if (message && !message.readBy.includes(userId as any)) {
          message.readBy.push(userId as any);
          message.isRead = true;
          await message.save();

          // Notify sender that message was read
          io.to(`conversation:${conversationId}`).emit('message:read', {
            messageId,
            userId,
            conversationId,
          });
        }
      } catch (error) {
        console.error('Error marking message as read:', error);
      }
    });

    // Handle notification events
    socket.on('notification:send', async (data: {
      recipientId: string;
      type: 'message' | 'friend_request' | 'system' | 'mention';
      title: string;
      message: string;
      link?: string;
    }) => {
      try {
        const { recipientId, type, title, message, link } = data;

        const notification = await Notification.create({
          recipient: recipientId,
          sender: userId,
          type,
          title,
          message,
          link,
        });

        await notification.populate('sender', 'username avatar');

        // Send notification to recipient if online
        io.to(recipientId).emit('notification:receive', notification);

        console.log(`Notification sent to ${recipientId}`);
      } catch (error) {
        console.error('Error sending notification:', error);
      }
    });

    // Handle disconnection
    socket.on('disconnect', async () => {
      console.log(`❌ User disconnected: ${username} (${userId})`);

      // Remove from online users
      onlineUsers.delete(userId);

      // Update user online status
      await User.findByIdAndUpdate(userId, { isOnline: false, lastSeen: new Date() });

      // Notify others that user is offline
      socket.broadcast.emit('user:offline', { userId, username });
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });
};

// Helper function to get online users
export const getOnlineUsers = () => {
  return Array.from(onlineUsers.keys());
};

// Helper function to emit to specific user
export const emitToUser = (io: Server, userId: string, event: string, data: any) => {
  const socketId = onlineUsers.get(userId);
  if (socketId) {
    io.to(socketId).emit(event, data);
  }
};