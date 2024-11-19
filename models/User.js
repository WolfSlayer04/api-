// ./models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  user_name: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  foto: { type: String },
  verificado: { type: String, default: 'No' },
});

module.exports = mongoose.model('User', UserSchema, 'Colección Usuarios2');
