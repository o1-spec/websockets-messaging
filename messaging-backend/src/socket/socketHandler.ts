import { Server, Socket } from "socket.io";
import Message from "../models/Message";
import Conversation from "../models/Conversation";
import Notification from "../models/Notification";
import User from "../models/User";
import { AuthenticatedSocket } from "./socketAuth";

// Store online users
const onlineUsers = new Map<string, string>(); // userId -> socketId

export const handleSocketConnection = (io: Server) => {
  io.on("connection", async (socket: AuthenticatedSocket) => {
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
    await User.findByIdAndUpdate(userId, {
      isOnline: true,
      lastSeen: new Date(),
    });

    // Notify others that user is online
    socket.broadcast.emit("user:online", { userId, username });

    // Join user's personal room
    socket.join(userId);

    // Handle user joining a conversation
    socket.on("conversation:join", async (conversationId: string) => {
      try {
        const conversation = await Conversation.findById(conversationId);
        if (
          conversation &&
          conversation.participants.some((p) => p.toString() === userId)
        ) {
          socket.join(`conversation:${conversationId}`);
          console.log(`User ${username} joined conversation ${conversationId}`);
        }
      } catch (error) {
        console.error("Error joining conversation:", error);
      }
    });

    // Handle user leaving a conversation
    socket.on("conversation:leave", (conversationId: string) => {
      socket.leave(`conversation:${conversationId}`);
      console.log(`User ${username} left conversation ${conversationId}`);
    });

    // Handle new conversation created
    socket.on(
      "conversation:created",
      async (data: { conversationId: string }) => {
        try {
          const { conversationId } = data;

          console.log(
            `📢 Conversation created event received: ${conversationId}`
          );

          const conversation = await Conversation.findById(
            conversationId
          ).populate("participants", "_id username email avatar isOnline");

          if (!conversation) {
            console.error("Conversation not found:", conversationId);
            return;
          }

          console.log(
            `Broadcasting conversation to ${conversation.participants.length} participants`
          );

          // Notify all participants about the new conversation
          conversation.participants.forEach((participant: any) => {
            const participantId = participant._id.toString();

            // Send conversation to participant
            io.to(participantId).emit("conversation:new", conversation);
            console.log(
              `✅ Sent conversation to: ${participant.username} (${participantId})`
            );

            // Send notification to other participants (not the creator)
            if (participantId !== userId) {
              const notification = {
                _id: new Date().getTime().toString(),
                type: "conversation",
                title: "New Conversation",
                message: `${username} wants to chat with you`,
                conversationId: conversation._id,
                sender: {
                  _id: userId,
                  username: username,
                },
                createdAt: new Date(),
                isRead: false,
              };

              io.to(participantId).emit("notification:new", notification);
              console.log(`🔔 Notification sent to: ${participant.username}`);

              // Create notification in database for offline users
              Notification.create({
                recipient: participantId,
                sender: userId,
                type: "system",
                title: "New Conversation",
                message: `${username} wants to chat with you`,
                link: `/chat?conversation=${conversationId}`,
                metadata: { conversationId },
              }).catch((err) =>
                console.error("Error creating notification:", err)
              );
            }
          });
        } catch (error) {
          console.error("Error handling conversation created:", error);
        }
      }
    );

    // Handle sending a message
    // Update the message:send handler

    socket.on(
      "message:send",
      async (data: {
        conversationId: string;
        content: string;
        messageType?: "text" | "image" | "file" | "video";
        fileUrl?: string;
      }) => {
        try {
          const {
            conversationId,
            content,
            messageType = "text",
            fileUrl,
          } = data;

          console.log(
            `📨 Message send event: ${conversationId} from ${username}`
          );

          // Verify user is part of conversation
          const conversation = await Conversation.findById(conversationId);
          if (
            !conversation ||
            !conversation.participants.some((p) => p.toString() === userId)
          ) {
            socket.emit("error", { message: "Not authorized" });
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
          await message.populate("sender", "username avatar");

          // Update conversation's last message
          conversation.lastMessage = message._id as any;
          await conversation.save();

          // Populate conversation for emitting
          await conversation.populate(
            "participants",
            "_id username email avatar isOnline"
          );

          console.log(`✅ Message created: ${message._id}`);

          // Emit message to conversation room ONLY (removes duplicate to sender)
          io.to(`conversation:${conversationId}`).emit(
            "message:receive",
            message
          );

          // Update conversation for all participants
          conversation.participants.forEach((participant: any) => {
            const participantId = participant._id.toString();
            io.to(participantId).emit("conversation:updated", conversation);
          });

          console.log(
            `Message broadcast to conversation room: ${conversationId}`
          );
        } catch (error) {
          console.error("Error sending message:", error);
          socket.emit("error", { message: "Failed to send message" });
        }
      }
    );

    // Handle typing indicator
    socket.on("typing:start", (conversationId: string) => {
      socket.to(`conversation:${conversationId}`).emit("typing:user", {
        userId,
        username,
        conversationId,
      });
    });

    socket.on("typing:stop", (conversationId: string) => {
      socket.to(`conversation:${conversationId}`).emit("typing:stop", {
        userId,
        conversationId,
      });
    });

    // Handle message read
    socket.on(
      "message:read",
      async (data: { messageId: string; conversationId: string }) => {
        try {
          const { messageId, conversationId } = data;

          const message = await Message.findById(messageId);
          if (message && !message.readBy.includes(userId as any)) {
            message.readBy.push(userId as any);
            message.isRead = true;
            await message.save();

            // Notify sender that message was read
            io.to(`conversation:${conversationId}`).emit("message:read", {
              messageId,
              userId,
              conversationId,
            });
          }
        } catch (error) {
          console.error("Error marking message as read:", error);
        }
      }
    );

    // Handle disconnection
    socket.on("disconnect", async () => {
      console.log(`❌ User disconnected: ${username} (${userId})`);

      // Remove from online users
      onlineUsers.delete(userId);

      // Update user online status
      await User.findByIdAndUpdate(userId, {
        isOnline: false,
        lastSeen: new Date(),
      });

      // Notify others that user is offline
      socket.broadcast.emit("user:offline", { userId, username });
    });

    // Handle errors
    socket.on("error", (error) => {
      console.error("Socket error:", error);
    });
  });
};

export const getOnlineUsers = () => {
  return Array.from(onlineUsers.keys());
};

export const emitToUser = (
  io: Server,
  userId: string,
  event: string,
  data: any
) => {
  const socketId = onlineUsers.get(userId);
  if (socketId) {
    io.to(socketId).emit(event, data);
  }
};
