import mongoose, { Schema, Document } from 'mongoose';

export interface IConversation extends Document {
  _id: mongoose.Types.ObjectId;
  participants: mongoose.Types.ObjectId[];
  lastMessage?: mongoose.Types.ObjectId;
  isGroup: boolean;
  groupName?: string;
  groupAdmin?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: 'Message',
    },
    isGroup: {
      type: Boolean,
      default: false,
    },
    groupName: {
      type: String,
      trim: true,
    },
    groupAdmin: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
ConversationSchema.index({ participants: 1 });
ConversationSchema.index({ updatedAt: -1 });

// Pre-save validation (using async/await pattern)
ConversationSchema.pre('save', async function () {
  // Validate minimum participants
  if (this.participants.length < 2) {
    throw new Error('A conversation must have at least 2 participants');
  }
  
  // Validate group name for group conversations
  if (this.isGroup && !this.groupName) {
    throw new Error('Group conversations must have a name');
  }
  
  // Remove duplicate participants
  const uniqueParticipants = Array.from(
    new Set(this.participants.map(p => p.toString()))
  );
  
  this.participants = uniqueParticipants.map(
    id => new mongoose.Types.ObjectId(id)
  );
});

// Virtual for getting the other participant in a direct conversation
ConversationSchema.virtual('otherParticipant').get(function () {
  if (!this.isGroup && this.participants.length === 2) {
    return this.participants[1];
  }
  return null;
});

// Ensure virtuals are included when converting to JSON
ConversationSchema.set('toJSON', { virtuals: true });
ConversationSchema.set('toObject', { virtuals: true });

export default mongoose.model<IConversation>('Conversation', ConversationSchema);