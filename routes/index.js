const express = require('express');
const router = express.Router();
const usersRoutes = require('./users'); // Asegúrate de que esto esté correcto
const nursesRoutes = require('./nurses'); // Si lo tienes
const serviceRequestRoutes = require('./serviceRequests'); // Importa el archivo correcto

// Define las rutas
router.use('/users', usersRoutes);
router.use('/nurses', nursesRoutes);
router.use('/service-requests', serviceRequestRoutes); // Asegúrate de que esto sea correcto

module.exports = router;
