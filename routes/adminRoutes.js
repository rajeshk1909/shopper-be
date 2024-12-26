require("dotenv").config()
const express = require("express")
const router = express.Router()
const Admin = require("../models/adminModel")
const jwt = require("jsonwebtoken")

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

    const adminUser = new Admin({
      name,
      email,
      password,
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
        email,
        password,
        success: false,
        message: "Invalid email or password.",
      })
    }

    const isPasswordMatch = await admin.matchPassword(password)
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

    res.status(200).json({
      success: true,
      message: "Admin logged in successfully.",
      user: {
        token,
        id: admin._id,
        name: admin.name,
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
