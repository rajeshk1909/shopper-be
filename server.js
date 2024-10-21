require("dotenv").config()
const express = require("express")
const app = express()
const path = require("path")
const cors = require("cors")
const connectDB = require("./config/db")

// Middleware
app.use(express.json())
app.use(cors())

// Connect to the database
connectDB()

const PORT = process.env.PORT || 4000
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`))
