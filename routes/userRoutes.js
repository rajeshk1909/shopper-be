const express = require("express")
const User = require("../models/userModel")
const router = express.Router()
const jwt = require("jsonwebtoken")
const cookieParser = require("cookie-parser")

// POST: Add product to cart
router.post("/cart", async (req, res) => {
  const { productId, quantity, userId } = req.body

  try {
    if (!productId || !quantity || !userId) {
      return res.status(400).json({
        success: false,
        message: "Product ID, quantity, and user ID are required",
      })
    }

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    const existingProduct = user.cart.find(
      (item) => item.product.toString() === productId
    )

    if (existingProduct) {
      existingProduct.quantity = quantity
    } else {
      user.cart.push({ product: productId, quantity })
    }

    await user.save()

    res.status(200).json({
      success: true,
      message: "Product added to cart successfully",
      cart: user.cart,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// POST: Add product to wishlist
router.post("/wishlist", async (req, res) => {
  const { productId, userId } = req.body

  try {
    if (!productId || !userId) {
      return res.status(400).json({
        success: false,
        message: "Product ID and user ID are required",
      })
    }

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    const isProductInWishlist = user.wishlist.some(
      (item) => item.toString() === productId
    )

    if (isProductInWishlist) {
      return res.status(400).json({
        success: false,
        message: "Product is already in the wishlist",
      })
    }

    user.wishlist.push(productId)

    await user.save()

    res.status(200).json({
      success: true,
      message: "Product added to wishlist successfully",
      wishlist: user.wishlist,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// POST: User Registration
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body

  try {
    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide all required fields: name, email, and password.",
      })
    }

    // Check if the user already exists
    const userExists = await User.findOne({ email })
    if (userExists) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" })
    }

    // Create a new user
    const newUser = new User({
      name,
      email,
      password,
      role: "user",
    })

    await newUser.save()

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, message: "Server Error" })
  }
})

// GET : Fetch a user by Id
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params
    const user = await User.findById(id)

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    res.status(200).json({
      success: true,
      user: user,
    })
  } catch (error) {
    console.error(error)
    res.send(500).json({
      success: false,
      message: "Internal Server Error",
    })
  }
})

router.post("/logout", (req, res) => {
  res
    .clearCookie("jwt", {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    })
    .clearCookie("id", {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    })
    .clearCookie("role", {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    })

  res.status(200).json({ message: "Logged out successfully" })
})

// POST: User Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body

  try {
    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields: email and password.",
      })
    }

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password.",
      })
    }

    const isPasswordMatch = await user.matchPassword(password)
    if (!isPasswordMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password.",
      })
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    )

    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, 
    })
    res.cookie("id", user._id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, 
    })
    res.cookie("role", user.role, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, 
    })

    // Send response
    res.status(200).json({
      success: true,
      message: "User logged in successfully.",
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
      message: "Server error.",
    })
  }
})


module.exports = router
