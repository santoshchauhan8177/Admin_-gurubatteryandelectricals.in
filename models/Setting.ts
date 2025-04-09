import mongoose, { type Document, type Model, Schema } from "mongoose"

export interface ISetting extends Document {
  storeName: string
  storeEmail: string
  storePhone: string
  storeAddress: string
  storeCurrency: string
  storeLanguage: string
  enableTax: boolean
  taxRate: string
  enableShipping: boolean
  flatRateShipping: string
  orderEmailNotification: boolean
  lowStockThreshold: string
  maintenanceMode: boolean
  storeDescription: string
  storeTerms: string
  storePrivacyPolicy: string
  createdAt: Date
  updatedAt: Date
}

const SettingSchema = new Schema<ISetting>(
  {
    storeName: {
      type: String,
      default: "",
    },
    storeEmail: {
      type: String,
      default: "",
    },
    storePhone: {
      type: String,
      default: "",
    },
    storeAddress: {
      type: String,
      default: "",
    },
    storeCurrency: {
      type: String,
      default: "USD",
    },
    storeLanguage: {
      type: String,
      default: "en",
    },
    enableTax: {
      type: Boolean,
      default: false,
    },
    taxRate: {
      type: String,
      default: "0",
    },
    enableShipping: {
      type: Boolean,
      default: false,
    },
    flatRateShipping: {
      type: String,
      default: "0",
    },
    orderEmailNotification: {
      type: Boolean,
      default: true,
    },
    lowStockThreshold: {
      type: String,
      default: "5",
    },
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    storeDescription: {
      type: String,
      default: "",
    },
    storeTerms: {
      type: String,
      default: "",
    },
    storePrivacyPolicy: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
)

const Setting = mongoose.models.Setting || mongoose.model<ISetting>("Setting", SettingSchema)

export default Setting as Model<ISetting>
