import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export const uploadImage = async (file: string): Promise<string> => {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder: "ecommerce",
    })
    return result.secure_url
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error)
    throw new Error("Failed to upload image")
  }
}

export const deleteImage = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId)
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error)
    throw new Error("Failed to delete image")
  }
}

export default cloudinary
