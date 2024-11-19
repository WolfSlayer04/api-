const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  service_request_id: { type: String, required: true }, // ID de la solicitud de servicio asociada
  sender_id: { type: String, required: true }, // ID del usuario que envía el mensaje
  receiver_id: { type: String, required: true }, // ID del usuario que recibe el mensaje
  content: { type: String, required: true }, // Contenido del mensaje
  timestamp: { type: Date, default: Date.now } // Fecha y hora del mensaje
});

module.exports = mongoose.model('Message', MessageSchema);
