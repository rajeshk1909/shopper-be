const express = require("express")
const User = require("../models/userModel")
const router = express.Router()
const generateToken = require("../utility/generateToken")

// POST: User Registration
router.post("/user/register", async (req, res) => {
  const { name, email, password } = req.body

  try {
    const userExists = await User.findOne({ email })
    if (userExists) {
      return res.status(400).json({ message: "User already exists" })
    }

    const newUser = new User({
      name,
      email,
      password,
      role: "user",
    })

    await newUser.save()

    const token = generateToken(newUser._id, newUser.role)

    res.status(201).json({
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
    res.status(500).json({ message: "Server Error" })
  }
})

router.post("/login", async (req, res) => {
  const { email, password } = req.body
  try {
    const user = await User.findOne({ email })

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid user email",
      })
    }

    const isPasswordMatch = User.matchpassword(password)

    if (!isPasswordMatch) {
      return res.status(400).json({
        success: false,
        message: "Incorrect password",
      })
    }

    const token = generateToken(newUser._id, newUser.role)

    res.json({
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
