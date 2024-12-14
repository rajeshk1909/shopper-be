const mongoose = require("mongoose")

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    discountPercentage: {
      type: Number,
      required: true,
    },
    discountPrice: {
      type: Number,
      required: false,
      default: function () {
        return this.price - this.price * (this.discountPercentage / 100)
      },
    },
    category: {
      type: String,
      required: true,
    },
    starRating: {
      type: Number,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
)

const Product = mongoose.model("Product", productSchema)

module.exports = Product