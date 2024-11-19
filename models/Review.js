// models/Review.js
const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  user_id: String,
  nurse_id: String,
  rating: Number,
  comentario: String,
  fecha: { type: Date, default: Date.now }
  
}, { timestamps: true }); // Agrega campos de createdAt y updatedAt

module.exports = mongoose.model('Review', ReviewSchema);
