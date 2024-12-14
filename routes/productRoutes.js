const express = require("express")
const Product = require("../models/productModel")
const router = express.Router()

// POST: Add a new product

router.post("/products", async (req, res) => {
  try {
    const { name, price, discountPercentage, category, starRating, image } =
      req.body

    if (
      !name ||
      !price ||
      !discountPercentage ||
      !category ||
      !starRating ||
      !image
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      })
    }

    const newProduct = new Product({
      name,
      price,
      discountPercentage,
      category,
      starRating,
      image,
    })

    await newProduct.save()

    res.status(201).json({
      success: true,
      message: "Product created successfully!",
      product: newProduct,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Failed to create product",
    })
  }
})

// GET: Fetch all products

router.get("/products", async (req, res) => {
  try {
    const products = await Product.find()
    res.status(200).json({
      success: true,
      products,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch all products",
    })
  }
})

// GET: Fetch a single product by ID

router.get("/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      })
    }
    res.status(200).json({
      success: true,
      product,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch product",
    })
  }
})

// PUT : Update a product by ID

router.put("/products", async (req, res) => {
  try {
    const { name, price, discountPercentage, category, starRating, image } =
      req.body

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name,
        price,
        discountPercentage,
        category,
        starRating,
        image,
      },
      { new: true }
    )

    if (!updatedProduct) {
      res.status(404).json({
        success: false,
        message: "Product not found",
      })
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfuly",
      product: updatedProduct,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Failed to update product",
    })
  }
})

// DELETE : Delete a product by ID

router.delete("/products", async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id)

    if (!deletedProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      })
    }

    res.status(200).json({
      success: false,
      message: "Product deleted successfully",
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Falid to delete a product",
    })
  }
})

module.exports = router
