import mongoose, { type Document, type Model, Schema } from "mongoose"

export interface IMedia extends Document {
  url: string
  filename: string
  type: string
  size: number
  width?: number
  height?: number
  createdAt: Date
  updatedAt: Date
}

const MediaSchema = new Schema<IMedia>(
  {
    url: {
      type: String,
      required: true,
    },
    filename: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    width: {
      type: Number,
    },
    height: {
      type: Number,
    },
  },
  { timestamps: true },
)

const Media = mongoose.models.Media || mongoose.model<IMedia>("Media", MediaSchema)

export default Media as Model<IMedia>
