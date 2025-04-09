import mongoose, { type Document, type Model, Schema } from "mongoose"

export interface IReview extends Document {
  product: mongoose.Types.ObjectId
  customer: mongoose.Types.ObjectId
  rating: number
  title: string
  comment: string
  isApproved: boolean
  reply?: string
  replyDate?: Date
  isReplied: boolean
  createdAt: Date
  updatedAt: Date
}

const ReviewSchema = new Schema<IReview>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    customer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    comment: {
      type: String,
      required: true,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    reply: {
      type: String,
    },
    replyDate: {
      type: Date,
    },
    isReplied: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
)

// Compound index to ensure a user can only review a product once
ReviewSchema.index({ product: 1, customer: 1 }, { unique: true })

const Review = mongoose.models.Review || mongoose.model<IReview>("Review", ReviewSchema)

export default Review as Model<IReview>
