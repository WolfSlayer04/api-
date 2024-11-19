const mongoose = require('mongoose');

const SupportRequestSchema = new mongoose.Schema({
  user_id: { type: String, required: true }, // ID del usuario que envía la solicitud
  tipo_usuario: { type: String, enum: ['usuario', 'enfermero'], required: true },
  asunto: { type: String, required: true }, // Breve descripción del problema
  mensaje: { type: String, required: true }, // Descripción detallada del problema
  estado: { type: String, default: 'pendiente' } // Estado de la solicitud
}, { timestamps: true }); // Incluye createdAt y updatedAt

module.exports = mongoose.model('SupportRequest', SupportRequestSchema);
