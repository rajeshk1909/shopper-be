const express = require("express")
const upload = require("../middlewares/upload")
const router = express.Router()

router.post("/upload", upload.single("product"), (req, res) => {
  const host =
    process.env.HOST || `http://localhost:${process.env.PORT || 4000}`

  if (!req.file) {
    return res.status(400).json({
      success: 0,
      error: "No file uploaded",
    })
  }

  res.json({
    success: 1,
    image_url: `${host}/images/${req.file.filename}`,
  })
})

module.exports = router
