import { Schema, model, Document, Types } from 'mongoose';

export interface ITicket extends Document {
  title: string;
  description: string;
  status: string;
  user: Types.ObjectId;
  type: string;
  priority: string;
  image?: string[];
  assignedTo?: Types.ObjectId | null;
}

const TicketSchema = new Schema<ITicket>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true },
  priority: { type: String, required: true },
  image: { type: [String], default: [] },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
});

export default model<ITicket>('Ticket', TicketSchema);
