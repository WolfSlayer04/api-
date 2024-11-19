const express = require('express');
const Nurse = require('../models/Nurse');
const { authenticateToken, generateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Nurses
 *   description: Endpoints para la gestión de enfermeros
 */

/**
 * @swagger
 * /nurses:
 *   get:
 *     summary: Obtener enfermeros (sin datos sensibles) con paginación
 *     tags: [Nurses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página (por defecto 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Número de resultados por página (por defecto 10)
 *     responses:
 *       200:
 *         description: Lista de enfermeros
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 nurses:
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
 *                       especialidad:
 *                         type: string
 *                       ubicacion:
 *                         type: string
 *                       tarifa:
 *                         type: number
 *                       disponibilidad:
 *                         type: array
 *                         items:
 *                           type: string
 *                       certificados:
 *                         type: array
 *                         items:
 *                           type: string
 *       500:
 *         description: Error en el servidor
 */
router.get('/', authenticateToken, async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  try {
    const skip = (page - 1) * limit;

    const [total, nurses] = await Promise.all([
      Nurse.countDocuments(), // Total de enfermeros
      Nurse.find({}, '-user_name -password -_id') // Excluir campos sensibles
        .skip(skip) // Paginación: saltar registros
        .limit(Number(limit)) // Límite por página
    ]);

    res.status(200).json({
      total, // Total de enfermeros
      page: Number(page), // Página actual
      limit: Number(limit), // Límite por página
      nurses // Lista de enfermeros
    });
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
});

/**
 * @swagger
 * /nurses/search:
 *   get:
 *     summary: Búsqueda de enfermeros con filtros y paginación
 *     tags: [Nurses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: especialidad
 *         schema:
 *           type: string
 *         description: Especialidad del enfermero (p. ej., geriatría, cuidados intensivos)
 *       - in: query
 *         name: ubicacion
 *         schema:
 *           type: string
 *         description: Ubicación del enfermero para facilitar desplazamientos
 *       - in: query
 *         name: tarifa
 *         schema:
 *           type: number
 *         description: Tarifa máxima diaria del enfermero
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página (por defecto 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Número de resultados por página (por defecto 10)
 *     responses:
 *       200:
 *         description: Lista de enfermeros que cumplen con los filtros
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 nurses:
 *                   type: array
 *                   items:
 *                     properties:
 *                       name:
 *                         type: string
 *                       especialidad:
 *                         type: string
 *                       ubicacion:
 *                         type: string
 *                       tarifa:
 *                         type: number
 *       500:
 *         description: Error en el servidor
 */
router.get('/search', authenticateToken, async (req, res) => {
  const { especialidad, ubicacion, tarifa, page = 1, limit = 10 } = req.query;

  const filters = {};
  if (especialidad) filters.especialidad = especialidad;
  if (ubicacion) filters.ubicacion = ubicacion;
  if (tarifa) filters.tarifa = { $lte: tarifa };

  try {
    const skip = (page - 1) * limit;

    const [total, nurses] = await Promise.all([
      Nurse.countDocuments(filters), // Total de enfermeros que cumplen con los filtros
      Nurse.find(filters, '-user_name -password -_id') // Excluir campos sensibles
        .skip(skip) // Paginación
        .limit(Number(limit)) // Límite por página
    ]);

    res.status(200).json({
      total, // Total de resultados
      page: Number(page), // Página actual
      limit: Number(limit), // Límite por página
      nurses // Lista de enfermeros
    });
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
});

// Los demás endpoints permanecen sin cambios

/**
 * @swagger
 * /nurses/register:
 *   post:
 *     summary: Registro de enfermero
 *     tags: [Nurses]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               user_name:
 *                 type: string
 *               password:
 *                 type: string
 *               especialidad:
 *                 type: string
 *     responses:
 *       201:
 *         description: Enfermero registrado exitosamente
 *       400:
 *         description: Error en el registro del enfermero
 */
router.post('/register', async (req, res) => {
  try {
    const { name, user_name, password, especialidad } = req.body;

    const newNurse = new Nurse({ name, user_name, password, especialidad });
    await newNurse.save();

    const token = generateToken(newNurse._id);
    res.status(201).json({
      message: 'Enfermero registrado exitosamente',
      nurse: newNurse,
      token: `Bearer ${token}`
    });
  } catch (error) {
    res.status(400).json({ message: 'Error en el registro del enfermero', error: error.message });
  }
});

/**
 * @swagger
 * /nurses/login:
 *   post:
 *     summary: Inicio de sesión de enfermero
 *     tags: [Nurses]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_name:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso
 *       401:
 *         description: Credenciales incorrectas
 */
router.post('/login', async (req, res) => {
  const { user_name, password } = req.body;

  try {
    const nurse = await Nurse.findOne({ user_name, password });
    if (!nurse) {
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }

    const token = generateToken({ userId: nurse._id, role: 'enfermero' });
    res.json({ token, role: 'enfermero' });
  } catch (error) {
    res.status(500).json({ message: 'Error en el inicio de sesión', error: error.message });
  }
});

module.exports = router;
