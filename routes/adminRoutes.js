const express = require("express")
const Admin = require("../models/adminModel")
const router = express.Router()
const generateToken = require("../utility/generateToken")

// POST: Admin Registration
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body
  const role = req.headers.role

  try {
    if (role !== "admin") {
      return res.status(403).json({
        sucess: false,
        message: "Access denied. Only admin can create an admin.",
      })
    }

    const adminExists = await Admin.findOne({ email })
    if (adminExists) {
      return res
        .status(400)
        .json({ sucess: false, message: "Admin already exists" })
    }

    const adminUser = new Admin({
      name,
      email,
      password,
      role: "admin",
    })

    await adminUser.save()

    const token = generateToken(adminUser._id, adminUser.role)

    if (!token) {
      res.status(403).json({
        success: false,
        message: "token is not generated",
      })
    }

    res.status(201).json({
      sucess: true,
      message: "Admin registered successfully",
      token,
      user: {
        id: adminUser._id,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role,
      },
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ sucess: false, message: "Server Error" })
  }
})

// POST : Admin login
router.post("/login", async (req, res) => {
  const { email, password } = req.body

  try {
    const admin = await Admin.findOne({ email })

    if (!admin) {
      return res.status(400).json({
        success: false,
        message: "Invalid admin email",
      })
    }

    const isPasswordMatch = await admin.matchPassword(password)

    if (!isPasswordMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid admin password",
      })
    }

    const token = generateToken(admin._id, admin.role)

    res.json({
      success: true,
      message: "Admin logged in successfully",
      token,
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
      message: "Server Error",
    })
  }
})

module.exports = router
