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

ConversationSchema.index({ participants: 1 });
ConversationSchema.index({ updatedAt: -1 });

ConversationSchema.pre('save' as any, function (this: IConversation, next: (err?: any) => void) {
  if (this.participants.length < 2) {
    return next(new Error('A conversation must have at least 2 participants'));
  }
  
  if (this.isGroup && !this.groupName) {
    return next(new Error('Group conversations must have a name'));
  }
  
  this.participants = Array.from(new Set(this.participants.map(p => p.toString()))).map(
    id => new mongoose.Types.ObjectId(id)
  );
  
  next();
});

ConversationSchema.virtual('otherParticipant').get(function (this: IConversation) {
  if (!this.isGroup && this.participants.length === 2) {
    return this.participants[1];
  }
  return null;
});

export default mongoose.model<IConversation>('Conversation', ConversationSchema);