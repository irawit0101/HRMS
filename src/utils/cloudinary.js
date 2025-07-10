import {v2 as cloudinary} from "cloudinary";
import fs from "fs";

    // Configuration
cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET 
});
    

const uploadOnCloudinary = async (localFilePath) => {
   try {
            if (!localFilePath) return null
            //upload cloudinary file
            cloudinary.uploader.upload(localFilePath, {
                resource_type: "auto"
            })
            console.log("file has been uploaded in cloudinary", 
                response.url
            ); 
            return response;
        
    } catch (error) {
            fs.unlinkSync(localFilePath)//remove the file which ffailed to upload on cloudinary
            return null
    }
}

export {uploadOnCloudinary}