const fileSystem = require("fs");
const cloudinary = require("cloudinary").v2;
const path = require("path");
//  const { checkInternetConnection } = require("../middlewares/internetAccess");

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDNAME,
  api_key: process.env.CLOUDAPIKEY,
  api_secret: process.env.CLOUDINARYSECRET,
  secure: true,
});

// Config Options
const options = {
  resource_type: "auto",
  folder: process.env.CLOUDFOLDER,
};

// Create the "uploads" in root directory if it doesn't exist
const uploadsDir = path.join(__dirname, "../../uploads");
if (!fileSystem.existsSync(uploadsDir)) {
  fileSystem.mkdirSync(uploadsDir);
}

// Function to clean up unused file from Tmp Folder
const deleteFileFromTmpFolder = (fileName) => {
  fileSystem.unlink(fileName, (err) => {
    if (err) throw err;
  });
};

const uploadToCloudinary = async (compressedFile) => {
  try {
    const result = await cloudinary.uploader.upload(
      `uploads/${compressedFile}`,
      options,
    );
    return result;
  } catch (err) {
   res.status(500).json("Error uploading files to cloud")
   return next(err);
  }
};

const getFileExtension = (uploadedFiles) => {
  return uploadedFiles.name.split(".").pop().toLowerCase();
};

const getFileName = (uploadedFiles) => {
  return uploadedFiles.name.replace(/\..+$/, "");
};

const renamedFileName = (fileName, extension) => {
  return `new-${fileName}-${Date.now()}.${extension}`;
};

const saveUncompressibleFiles = async (updatedFileName, uploadedFile) => {
  try {
    const savePath = path.resolve(`uploads/${updatedFileName}`);
    await uploadedFile.mv(savePath);
  } catch (err) {
    res.status(500).json("Error saving files");
    return next(err);
  }
};

exports.cloudinaryUploader = async (req, res, next) => {
  try {
    if (req.files) {
      
      const fileCategories = ["images" ];

      // Initialize arrays
      fileCategories.forEach((category) => {
        req.body[category] = [];
      });

      const allFiles = {
        images: req.files.images || [],
        courseOutline: req.files.courseOutline || [],
        dataset: req.files.dataset || [],
        datasetDocs: req.files.datasetDocs || []
      };

      // const isOnline = await checkInternetConnection();

      // if (!isOnline) {
      //     Object.values(allFiles)
      //         .flat()
      //         .forEach((file) => deleteFileFromTmpFolder(file.tempFilePath));
      //     return res.status(403).json("No Internet Access");
      // }
      
      const unCompressibleExtensions = ["wav"];

      for (const [category, uploadedFiles] of Object.entries(allFiles)) {
        if (fileCategories.includes(category)) {
            if (!Array.isArray(uploadedFiles)) {
                const fileExtension = getFileExtension(uploadedFiles);
                const originalFileName = getFileName(uploadedFiles);
                const updatedFileName = renamedFileName(originalFileName, fileExtension);
    
                if (!unCompressibleExtensions.includes(fileExtension)) {
                    await saveUncompressibleFiles(updatedFileName, uploadedFiles);
                    const result = await uploadToCloudinary(updatedFileName);
                    req.body[category].push({ url: result.secure_url });
                    deleteFileFromTmpFolder(`uploads/${updatedFileName}`);
                } else {
                    throw new Error("File type not allowed");
                }
            } else {
                await Promise.all(
                    uploadedFiles.map(async (file) => {

                     
                        const fileExtension = getFileExtension(file);
                        const originalFileName = getFileName(file);
                        const updatedFileName = renamedFileName(originalFileName, fileExtension);
    
                        if (!unCompressibleExtensions.includes(fileExtension)) {
                            await saveUncompressibleFiles(updatedFileName, file);
                            const result = await uploadToCloudinary(updatedFileName);
                            req.body[category].push({ url: result.secure_url });
                            deleteFileFromTmpFolder(`uploads/${updatedFileName}`);
                        } else {
                            throw new Error("File type not allowed");
                        }
                      
                    })
                );
            }
        }
    }
    }
    next();
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
    return next(err);
  }
};
exports.deleteFromCloudinary = async (ImagesArr) => {
  try {
    let imageIds;

    // Check if ImagesArr is an array or a string
    if (Array.isArray(ImagesArr)) {
      // Extract image IDs if it's an array
      imageIds = ImagesArr.map(
        (item) => item.url.split("/").pop().split(".")[0]
      );
    } else if (typeof ImagesArr === "string") {
      // Extract image ID if it's a single string
      const id = ImagesArr.split("/").pop().split(".")[0];
      imageIds = [id]; // Wrap in an array for consistency
    } else {
      throw new Error("Invalid input: ImagesArr must be an array or a string.");
    }

    // Delete images from Cloudinary
    await Promise.all(
      imageIds.map(async (id) => {
        try {
          const success = await cloudinary.uploader.destroy(`${options.folder}/${id}`);
          console.log(`Successfully deleted image with ID ${id}`);
          return success;
        } catch (destroyErr) {
          console.error(`Error destroying image with ID ${id}: ${destroyErr}`);
        }
      })
    );
  } catch (err) {
    console.error(`Error deleting images from Cloudinary: ${err}`);
    // Handle the error as needed
  }
};

