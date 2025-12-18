import { Schema, model, Document, Types } from 'mongoose';

export interface IComment extends Document {
  ticket: Types.ObjectId;
  author: string;
  text: string;
  createdAt: Date;
}

const CommentSchema = new Schema<IComment>({
  ticket: { type: Schema.Types.ObjectId, ref: 'Ticket', required: true },
  author: { type: String, required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default model<IComment>('Comment', CommentSchema);
