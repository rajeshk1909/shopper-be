const express = require("express")
const { upload, uploadToCloudinary } = require("../middlewares/upload")
const router = express.Router()

// POST route for uploading a file
router.post("/", upload.single("product"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "File is required",
    })
  }

  try {
    const cloudinaryResult = await uploadToCloudinary(req.file)

    return res.status(200).json({
      success: true,
      message: "File successfully uploaded",
      image_url: cloudinaryResult.secure_url, 
    })
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error)
    return res.status(500).json({
      success: false,
      message: "Error uploading image",
      error: error.message, 
    })
  }
})

module.exports = router
