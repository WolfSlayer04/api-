// models/Nurse.js
const mongoose = require('mongoose');

const NurseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  fecha_nacimiento: { type: String, required: true },
  genero: { type: String, required: true },
  descripcion: { type: String },
  usuario_id: { type: String },
  especialidad: { type: String, required: true },
  ubicacion: { type: String, required: true },
  tarifa: { type: Number, required: true },
  disponibilidad: [
    {
      dia: { type: String, required: true }, // Ej: "Lunes"
      horaInicio: { type: String, required: true }, // Ej: "08:00"
      horaFin: { type: String, required: true } // Ej: "17:00"
    }
  ],
  certificados: [String],
  user_name: { type: String, unique: true, required: true },
  password: { type: String, required: true }

});

module.exports = mongoose.model('Nurse', NurseSchema, 'Colección Enfermeros');
