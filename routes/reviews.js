const express = require('express');
const Review = require('../models/Review');
const ServiceRequest = require('../models/ServiceRequest');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: Endpoints para gestión de reseñas y calificaciones
 */

/**
 * @swagger
 * /reviews:
 *   post:
 *     summary: Crear una reseña y calificación para un enfermero
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nurse_id:
 *                 type: string
 *                 description: "ID del enfermero evaluado"
 *               service_request_id:
 *                 type: string
 *                 description: "ID de la solicitud de servicio completada"
 *               calificacion:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *                 description: "Calificación de 1 a 5"
 *               comentario:
 *                 type: string
 *                 description: "Comentario opcional sobre el servicio"
 *     responses:
 *       201:
 *         description: Reseña creada exitosamente
 *       400:
 *         description: Error al crear la reseña
 */
router.post('/', authenticateToken, async (req, res) => {
  const { nurse_id, service_request_id, calificacion, comentario } = req.body;

  try {
    // Verificar que el servicio fue completado
    const serviceRequest = await ServiceRequest.findOne({
      _id: service_request_id,
      user_id: req.userId,
      nurse_id,
      estado: 'completado'
    });

    if (!serviceRequest) {
      return res.status(400).json({ message: 'No se puede evaluar un servicio que no ha sido completado' });
    }

    // Crear la reseña
    const review = new Review({
      nurse_id,
      user_id: req.userId,
      service_request_id,
      calificacion,
      comentario
    });

    await review.save();

    res.status(201).json({ message: 'Reseña creada exitosamente', review });
  } catch (error) {
    res.status(400).json({ message: 'Error al crear la reseña', error: error.message });
  }
});

/**
 * @swagger
 * /reviews/{nurse_id}:
 *   get:
 *     summary: Obtener todas las reseñas y calificaciones de un enfermero con paginación
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: nurse_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del enfermero para obtener sus reseñas
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
 *         description: Lista de reseñas y calificaciones del enfermero
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
 *                 reviews:
 *                   type: array
 *                   items:
 *                     properties:
 *                       calificacion:
 *                         type: number
 *                       comentario:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       403:
 *         description: Acceso denegado
 *       404:
 *         description: Enfermero no encontrado o sin reseñas
 */
router.get('/:nurse_id', authenticateToken, async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  try {
    const nurse_id = req.params.nurse_id;

    // Verificar que el usuario autenticado es el enfermero que consulta las reseñas
    if (req.userId !== nurse_id) {
      return res.status(403).json({ message: 'Acceso denegado' });
    }

    const skip = (page - 1) * limit;

    const [total, reviews] = await Promise.all([
      Review.countDocuments({ nurse_id }),
      Review.find({ nurse_id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
    ]);

    if (!reviews.length) {
      return res.status(404).json({ message: 'No se encontraron reseñas para este enfermero' });
    }

    res.status(200).json({
      total,
      page: Number(page),
      limit: Number(limit),
      reviews
    });
  } catch (error) {
    res.status(400).json({ message: 'Error al obtener las reseñas', error: error.message });
  }
});

module.exports = router;
