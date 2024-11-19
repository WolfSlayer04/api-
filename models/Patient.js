const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  fecha_nacimiento: { type: String, required: true },
  genero: { type: String, required: true },
  movilidad: { type: String, required: true },
  descripcion: { type: String, required: true },
  usuario_id: { type: String, required: true } // Verifica si está configurado como obligatorio
});

module.exports = mongoose.model('Patient', patientSchema, 'Colección Pacientes');

const Patient = mongoose.model('Patient', patientSchema, 'Colección Pacientes');

module.exports = Patient;
