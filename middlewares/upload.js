const multer = require("multer")
const path = require("path")
const fs = require("fs")

// Ensure upload directory exists
const uploadDir = path.join(__dirname, "../upload/images")
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// Multer configuration
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    cb(
      null,
      `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`
    )
  },
})

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/jpg" , "image/svg"]
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    console.log(`Rejected file type: ${file.mimetype}`)
    cb(new Error("Only images are allowed"), false)
  }
}

const upload = multer({ storage, fileFilter })

module.exports = upload
