const express = require('express');
const FAQ = require('../models/FAQ');
const SupportRequest = require('../models/SupportRequest');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Support
 *   description: Endpoints para soporte técnico y ayuda
 */

/**
 * @swagger
 * /support/faq:
 *   get:
 *     summary: Obtener la lista de preguntas frecuentes (FAQ) con paginación
 *     tags: [Support]
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
 *         description: Lista de preguntas frecuentes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   description: Total de preguntas frecuentes
 *                 page:
 *                   type: integer
 *                   description: Página actual
 *                 limit:
 *                   type: integer
 *                   description: Límite de preguntas por página
 *                 faqs:
 *                   type: array
 *                   items:
 *                     properties:
 *                       pregunta:
 *                         type: string
 *                       respuesta:
 *                         type: string
 */
router.get('/faq', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const faqs = await FAQ.find().skip(skip).limit(Number(limit));
    const total = await FAQ.countDocuments();

    res.status(200).json({
      total,
      page: Number(page),
      limit: Number(limit),
      faqs
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener las preguntas frecuentes', error: error.message });
  }
});

/**
 * @swagger
 * /support/request:
 *   post:
 *     summary: Enviar una solicitud de soporte técnico
 *     tags: [Support]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               asunto:
 *                 type: string
 *                 description: "Asunto de la solicitud de soporte"
 *               mensaje:
 *                 type: string
 *                 description: "Descripción detallada del problema"
 *     responses:
 *       201:
 *         description: Solicitud de soporte enviada exitosamente
 *       400:
 *         description: Error al enviar la solicitud de soporte
 */
router.post('/request', authenticateToken, async (req, res) => {
  const { asunto, mensaje } = req.body;

  try {
    if (!asunto || !mensaje) {
      return res.status(400).json({ message: 'El asunto y el mensaje son obligatorios' });
    }

    const supportRequest = new SupportRequest({
      user_id: req.userId,
      tipo_usuario: req.userRole, // Asume que el middleware agrega el rol
      asunto,
      mensaje
    });

    await supportRequest.save();

    res.status(201).json({
      message: 'Solicitud de soporte enviada exitosamente',
      supportRequest
    });
  } catch (error) {
    res.status(400).json({ message: 'Error al enviar la solicitud de soporte', error: error.message });
  }
});

module.exports = router;
