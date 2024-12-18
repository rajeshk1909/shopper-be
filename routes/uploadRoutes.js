const express = require("express")
const upload = require("../middlewares/upload")
const router = express.Router()

router.post("/", upload.single("product"), (req, res) => {
  const host = process.env.HOST || "https://shopper-be.onrender.com/"

  if (!req.file) {
    return res.status(400).json({
      success: 0,
      error: "No file uploaded",
    })
  }

  res.status(200).json({
    success: true,
    image_url: `${host}/images/${req.file.filename}`,
  })
})

module.exports = router
