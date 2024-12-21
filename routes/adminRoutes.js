const express = require("express")
const Admin = require("../models/adminModel")
const router = express.Router()

// POST: Admin Registration
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body
  const role = req.headers.role

  try {
    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide all required fields: name, email, and password.",
      })
    } else if (!role) {
      return res.status(400).json({
        success: false,
        message: "Please provide the role",
      })
    }

    if (role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only admin can create an admin.",
      })
    }

    const adminExists = await Admin.findOne({ email })
    if (adminExists) {
      return res
        .status(400)
        .json({ success: false, message: "Admin already exists" })
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
      message: "Admin registered successfully",
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

// GET : Fetch a Admin by Id
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params
    const admin = await Admin.findById(id)

    if (!admin) {
      res.status(404).json({
        success: false,
        message: "Admin not found",
      })
    }

    res.status(200).json({
      success: true,
      admin: admin,
    })
  } catch (error) {
    console.error(error)
    res.send(500).json({
      success: false,
      message: "Internal Server Error",
    })
  }
})

// POST : Admin login
router.post("/login", async (req, res) => {
  const { email, password } = req.body

  try {
    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields: email, and password.",
      })
    }

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

    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    )

    res
      .cookie("userId", admin._id.toString(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .cookie("role", admin.role.toString(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })

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
