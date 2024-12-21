const express = require("express")
const Admin = require("../models/adminModel")
const jwt = require("jsonwebtoken")
const cookieParser = require("cookie-parser")
const bcrypt = require("bcryptjs") 
require("dotenv").config()

const router = express.Router()
router.use(cookieParser())

// POST: Admin Registration
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body
  const role = req.headers.role

  try {
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "All fields are required: name, email, password, role.",
      })
    }

    if (role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admin can create an admin.",
      })
    }

    const adminExists = await Admin.findOne({ email })
    if (adminExists) {
      return res.status(400).json({
        success: false,
        message: "Admin already exists.",
      })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const adminUser = new Admin({
      name,
      email,
      password: hashedPassword,
      role: "admin",
    })

    await adminUser.save()

    res.status(201).json({
      success: true,
      message: "Admin registered successfully.",
      user: {
        id: adminUser._id,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role,
      },
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, message: "Server Error" })
  }
})

// GET: Fetch Admin by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params
    const admin = await Admin.findById(id)

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found.",
      })
    }

    res.status(200).json({
      success: true,
      admin,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Internal Server Error.",
    })
  }
})

// POST: Admin Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body

  try {
    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      })
    }

    // Find admin by email
    const admin = await Admin.findOne({ email })
    if (!admin) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password.",
      })
    }

    const isPasswordMatch = await bcrypt.compare(password, admin.password)
    if (!isPasswordMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password.",
      })
    }

    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" } 
    )

    res.cookie("jwt", token, {
      httpOnly: true, 
      secure: process.env.NODE_ENV === "production", 
      sameSite: "strict", 
      maxAge: 7 * 24 * 60 * 60 * 1000, 
    })
    res.cookie("id", admin._id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    res.cookie("role", admin.role, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    res.status(200).json({
      success: true,
      message: "Admin logged in successfully.",
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Server Error.",
    })
  }
})


module.exports = router
