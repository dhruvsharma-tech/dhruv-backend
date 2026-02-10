import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
const uploadOnCloudinary = async (localFileStorage) => {
  try {
    if (!localFileStorage) return null;

    cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
    const response = await cloudinary.uploader.upload(localFileStorage, {
      resource_type: "auto",
    });

    console.log("file uploaded successfully on cloudinary!!!", response.url);

    fs.unlinkSync(localFileStorage);
    return response;
  } catch (error) {
    console.log(error);
    if (localFileStorage) fs.unlinkSync(localFileStorage);
    return null;
  }
};

export { uploadOnCloudinary };
