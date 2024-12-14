require("dotenv").config()
const express = require("express")
const connectDB = require("./config/db")
const errorHandler = require("./middlewares/errorHandler")
const uploadRoutes = require("./routes/uploadRoutes")
const productRoutes = require("./routes/productRoutes")
const path = require("path")

const app = express()

// Middleware
app.use(express.json())

// Serve uploaded images
app.use("/images", express.static(path.join(__dirname, "upload/images")))

// Connect to the database
connectDB()

// Routes
app.use("/api/upload", uploadRoutes)
app.use("/api/products", productRoutes)

// Error handling middleware
app.use(errorHandler)

module.exports = app
