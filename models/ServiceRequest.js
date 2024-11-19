const mongoose = require('mongoose');

const ServiceRequestSchema = new mongoose.Schema({
  user_id: { type: String, required: true },  // ID del usuario que solicita el servicio
  nurse_id: { type: String, required: true }, // ID del enfermero asignado
  patient_ids: [{ type: String, required: true }], // IDs de los pacientes asociados
  estado: { type: String, default: 'pendiente' },
  detalles: { type: String }, // Detalles adicionales sobre el servicio
  fecha: { type: Date, required: true },
  tarifa: { type: Number, required: true },
  pago_realizado: { type: Boolean, default: false },
  estado: { type: String, default: 'pendiente' },
  pago_realizado: { type: Boolean, default: false }, // Estado de pago realizado
  pago_liberado: { type: Boolean, default: false }  ,
  documentacion_servicio: { type: String }, // Documentación o notas sobre el servicio realizado
  observaciones: { type: String }, // Observaciones sobre la atención prestada
  recomendaciones: { type: String } // Recomendaciones para el usuario

});

module.exports = mongoose.model('ServiceRequest', ServiceRequestSchema);
