require("dotenv").config()
const express = require("express")
const connectDB = require("./config/db")
const errorHandler = require("./middlewares/errorHandler")
const uploadRoutes = require("./routes/uploadRoutes")
const productRoutes = require("./routes/productRoutes")
const adminRoutes = require("./routes/adminRoutes")
const userRoutes = require("./routes/userRoutes")
const path = require("path")
const cors = require("cors")

const app = express()

// Middleware
app.use(express.json())

// Configure CORS
const allowedOrigins = [
  "http://localhost:3000",
  "https://shopshere-fe.vercel.app",
  "https://shopsphere-fe.onrender.com",
]

app.use(
  cors({
    origin: (origin, callback) => {
      
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error("Not allowed by CORS"))
      }
    },
    credentials: true, 
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], 
  })
)

// Serve uploaded images
app.use("/images", express.static(path.join(__dirname, "upload/images")))

// Connect to the database
connectDB()

// Routes
app.use("/api/upload", uploadRoutes)
app.use("/api/products", productRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/user", userRoutes)

// Error handling middleware
app.use(errorHandler)

module.exports = app
