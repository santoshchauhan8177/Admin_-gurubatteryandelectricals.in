import mongoose, { type Document, type Model, Schema } from "mongoose"

export interface IProduct extends Document {
  name: string
  slug: string
  description: string
  price: number
  comparePrice?: number
  images: string[]
  category: mongoose.Types.ObjectId
  inventory: number
  sku: string
  featured: boolean
  isActive: boolean
  attributes: Record<string, string>
  createdAt: Date
  updatedAt: Date
}

const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, "Please provide a product name"],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Please provide a product description"],
    },
    price: {
      type: Number,
      required: [true, "Please provide a product price"],
      min: [0, "Price cannot be negative"],
    },
    comparePrice: {
      type: Number,
      min: [0, "Compare price cannot be negative"],
    },
    images: {
      type: [String],
      default: [],
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Please provide a category"],
    },
    inventory: {
      type: Number,
      required: [true, "Please provide inventory count"],
      min: [0, "Inventory cannot be negative"],
      default: 0,
    },
    sku: {
      type: String,
      required: [true, "Please provide a SKU"],
      unique: true,
      trim: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    attributes: {
      type: Map,
      of: String,
      default: {},
    },
  },
  { timestamps: true },
)

// Create text index for search
ProductSchema.index({ name: "text", description: "text" })

const Product = mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema)

export default Product as Model<IProduct>
