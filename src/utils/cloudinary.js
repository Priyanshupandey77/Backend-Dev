import dotenv from "dotenv";
dotenv.config();
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    console.log("Cloudinary upload success:", response.secure_url);
    fs.unlinkSync(localFilePath); // cleanup AFTER success
    return response;

  } catch (error) {
    console.error("Cloudinary upload error:", error.message);
    console.error(error); // VERY IMPORTANT
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    throw error; //  DO NOT RETURN NULL
  }
};

export {uploadOnCloudinary}
