const express = require('express');
const Patient = require('../models/Patient');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Patients
 *   description: Endpoints para la gestión de pacientes
 */

/**
 * @swagger
 * /patients:
 *   get:
 *     summary: Obtener pacientes del usuario autenticado con paginación
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de la página (por defecto 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Número de elementos por página (por defecto 10)
 *     responses:
 *       200:
 *         description: Lista de pacientes del usuario autenticado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   description: Número total de pacientes
 *                 page:
 *                   type: integer
 *                   description: Página actual
 *                 limit:
 *                   type: integer
 *                   description: Límite de pacientes por página
 *                 patients:
 *                   type: array
 *                   items:
 *                     properties:
 *                       name:
 *                         type: string
 *                       fecha_nacimiento:
 *                         type: string
 *                       genero:
 *                         type: string
 *                       descripcion:
 *                         type: string
 *       500:
 *         description: Error al obtener los pacientes
 */
router.get('/', authenticateToken, async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  try {
    const skip = (page - 1) * limit;

    const [total, patients] = await Promise.all([
      Patient.countDocuments({ usuario_id: req.userId }),
      Patient.find({ usuario_id: req.userId })
        .skip(skip)
        .limit(Number(limit))
    ]);

    const patientsWithoutID = patients.map(patient => {
      const { _id, ...patientData } = patient.toObject();
      return patientData;
    });

    res.status(200).json({
      total,
      page: Number(page),
      limit: Number(limit),
      patients: patientsWithoutID
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los pacientes', error: error.message });
  }
});

/**
 * @swagger
 * /patients:
 *   post:
 *     summary: Agregar un nuevo paciente
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               fecha_nacimiento:
 *                 type: string
 *               genero:
 *                 type: string
 *               descripcion:
 *                 type: string
 *     responses:
 *       201:
 *         description: Paciente agregado exitosamente
 *       400:
 *         description: Error al crear el paciente
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const newPatient = new Patient({ ...req.body, usuario_id: req.userId });
    await newPatient.save();
    const { _id, ...patientData } = newPatient.toObject(); // Excluir `_id` de la respuesta
    res.status(201).json(patientData);
  } catch (error) {
    res.status(400).json({ message: 'Error al crear el paciente', error: error.message });
  }
});

module.exports = router;
