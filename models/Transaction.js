const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  nurse_id: { type: String, required: true }, // ID del enfermero que recibe el pago
  user_id: { type: String, required: true }, // ID del usuario que realizó el pago
  service_request_id: { type: String, required: true }, // ID de la solicitud de servicio asociada
  monto: { type: Number, required: true }, // Monto del pago
  fecha_pago: { type: Date, default: Date.now }, // Fecha del pago
  estado: { type: String, default: 'completado' } // Estado de la transacción
});

module.exports = mongoose.model('Transaction', TransactionSchema);
