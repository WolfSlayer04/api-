const jwt = require('jsonwebtoken');

// Generar un token
function generateToken(userId) {
    return jwt.sign({ userId }, 'tu_secreto_jwt', { expiresIn: '1h' });
}

// Middleware para autenticar el token
function authenticateToken(req, res, next) {
    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, 'tu_secreto_jwt', (err, user) => {
        if (err) return res.sendStatus(403);
        req.userId = user.userId;
        next();
    });
}

module.exports = { generateToken, authenticateToken };
