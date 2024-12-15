const express = require("express")
const User = require("../models/userModel")
const router = express.Router()
const generateToken = require("../utility/generateToken")

// POST: User Registration
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body

  try {
    // Check if the user already exists
    const userExists = await User.findOne({ email })
    if (userExists) {
      return res
        .status(400)
        .json({ sucess: false, message: "User already exists" })
    }

    // Create a new user
    const newUser = new User({
      name,
      email,
      password,
      role: "user",
    })

    await newUser.save()

    // Generate token for the new user
    const token = generateToken(newUser._id, newUser.role)

    if (!token) {
      res.status(403).json({
        success: false,
        message: "Token not generate",
      })
    }

    res.status(201).json({
      sucess: true,
      message: "User registered successfully",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ sucess: false, message: "Server Error" })
  }
})

// POST: User Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body

  try {
    // Find the user by email
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid user email",
      })
    }

    const isPasswordMatch = await user.matchPassword(password)
    if (!isPasswordMatch) {
      return res.status(400).json({
        success: false,
        message: "Incorrect password",
      })
    }

    const token = generateToken(user._id, user.role)

    res.status(200).json({
      success: true,
      message: "User logged in successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

module.exports = router
