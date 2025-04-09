import mongoose, { type Document, type Model, Schema } from "mongoose"

export interface IContact extends Document {
  name: string
  email: string
  subject: string
  message: string
  status: "new" | "read" | "replied" | "archived"
  isImportant: boolean
  reply?: string
  replyDate?: Date
  createdAt: Date
  updatedAt: Date
}

const ContactSchema = new Schema<IContact>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["new", "read", "replied", "archived"],
      default: "new",
    },
    isImportant: {
      type: Boolean,
      default: false,
    },
    reply: {
      type: String,
    },
    replyDate: {
      type: Date,
    },
  },
  { timestamps: true },
)

const Contact = mongoose.models.Contact || mongoose.model<IContact>("Contact", ContactSchema)

export default Contact as Model<IContact>
