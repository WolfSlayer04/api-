const mongoose = require('mongoose');

const FAQSchema = new mongoose.Schema({
  pregunta: { type: String, required: true }, // La pregunta frecuente
  respuesta: { type: String, required: true }  // La respuesta a la pregunta
});

module.exports = mongoose.model('FAQ', FAQSchema);
