const express = require('express');
const Transaction = require('../models/Transaction');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Transactions
 *   description: Endpoints para la gestión de pagos y facturación
 */

/**
 * @swagger
 * /transactions:
 *   get:
 *     summary: Obtener el historial de pagos recibidos por el enfermero con paginación
 *     tags: [Transactions]
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
 *         description: Historial de pagos del enfermero con paginación
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   description: Número total de transacciones
 *                 page:
 *                   type: integer
 *                   description: Página actual
 *                 limit:
 *                   type: integer
 *                   description: Límite de elementos por página
 *                 transactions:
 *                   type: array
 *                   items:
 *                     properties:
 *                       service_request_id:
 *                         type: string
 *                       monto:
 *                         type: number
 *                       fecha_pago:
 *                         type: string
 *                         format: date-time
 *                       estado:
 *                         type: string
 *       403:
 *         description: Acceso denegado
 *       500:
 *         description: Error en el servidor
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    // Calcular el índice de inicio
    const skip = (page - 1) * limit;

    // Obtener transacciones con paginación
    const transactions = await Transaction.find({ nurse_id: req.userId })
      .sort({ fecha_pago: -1 })
      .skip(skip)
      .limit(Number(limit));

    // Contar el total de transacciones
    const total = await Transaction.countDocuments({ nurse_id: req.userId });

    res.status(200).json({
      total,
      page: Number(page),
      limit: Number(limit),
      transactions
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el historial de pagos', error: error.message });
  }
});

/**
 * @swagger
 * /transactions/{id}/factura:
 *   post:
 *     summary: Generar una factura para un usuario
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la transacción
 *     responses:
 *       200:
 *         description: Factura generada y enviada exitosamente
 *       404:
 *         description: Transacción no encontrada
 *       403:
 *         description: Acceso denegado
 */
router.post('/:id/factura', authenticateToken, async (req, res) => {
  try {
    // Verificar que la transacción pertenece al enfermero autenticado
    const transaction = await Transaction.findOne({ _id: req.params.id, nurse_id: req.userId });

    if (!transaction) {
      return res.status(404).json({ message: 'Transacción no encontrada o acceso denegado' });
    }

    // Generar la factura (simulado aquí)
    const factura = {
      nurse_id: transaction.nurse_id,
      user_id: transaction.user_id,
      service_request_id: transaction.service_request_id,
      monto: transaction.monto,
      fecha_pago: transaction.fecha_pago,
      estado: transaction.estado,
      fecha_factura: new Date(),
      detalles: 'Servicio de enfermería proporcionado' // Personalizable
    };

    // Responder con la factura generada
    res.status(200).json({ message: 'Factura generada y enviada exitosamente', factura });
  } catch (error) {
    res.status(500).json({ message: 'Error al generar la factura', error: error.message });
  }
});

module.exports = router;
