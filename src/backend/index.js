//=======[ Settings, Imports & Data ]==========================================

var PORT = 3000;

var express = require('express');
var app = express();
var utils = require('./mysql-connector');

// to parse application/json
app.use(express.json());
// to serve static files
app.use(express.static('/home/node/app/static/'));

//======[ Routes ]=============================================================

// Middleware de autenticación básica para funcionalidades protegidas
app.use((req, res, next) => {
  const publicRoutes = ['/usuario', '/device', '/devices'];
  if (publicRoutes.some(route => req.path.startsWith(route))) return next();

  const auth = req.headers.authorization;
  if (!auth) return res.status(401).send('Acceso denegado');

  const base64Credentials = auth.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
  const [username, password] = credentials.split(':');

  if (username === 'admin' && password === 'admin') {
    next();
  } else {
    res.status(403).send('Credenciales inválidas');
  }
});

// Obtener dispositivo por ID
app.get('/device/:id', function (req, res) {
  utils.query("SELECT * FROM Devices WHERE id = ?", [req.params.id], (error, respuesta) => {
    if (error) return res.status(409).send(error.sqlMessage);
    res.status(200).json(respuesta[0] || {});
  });
});

// Obtener usuarios (mock)
app.get('/usuario', function (req, res) {
  res.json([{ id: 1, name: 'mramos' }, { id: 2, name: 'fperez' }]);
});

// Crear usuario (mock)
app.post('/usuario', function (req, res) {
  if (req.body.id && req.body.name) {
    res.sendStatus(201);
  } else {
    res.status(400).json({ mensaje: 'El id o el name no estaban cargados' });
  }
});

// Actualiza estado del dispositivo (encendido/apagado)
app.post('/device', function (req, res) {
  const { id, status } = req.body;
  utils.query("UPDATE Devices SET state = ? WHERE id = ?", [status, id], (err) => {
    if (err) return res.status(409).send(err.sqlMessage);
    res.status(200).json({ id: id, status: status });
  });
});

// Obtener lista de dispositivos (mock)
app.get('/devices', function (req, res) {
  const devices = [
    {
      id: 1,
      name: 'Lampara 1',
      description: 'Luz living',
      state: 0,
      type: 1,
      intensity: 0.5
    },
    {
      id: 2,
      name: 'Ventilador 1',
      description: 'Ventilador Habitacion',
      state: 1,
      type: 2,
      intensity: 1.0
    },
    {
      id: 3,
      name: 'Luz Cocina 1',
      description: 'Cocina',
      state: 1,
      type: 2,
      intensity: 0.75
    }
  ];
  res.status(200).json(devices);
});

// Actualiza intensidad del dispositivo
app.post('/device/:id/intensity', (req, res) => {
  const id = parseInt(req.params.id);
  const intensity = parseFloat(req.body.intensity);
  utils.query('UPDATE Devices SET intensity = ? WHERE id = ?', [intensity, id], (err) => {
    if (err) return res.status(500).send(err.sqlMessage);
    res.status(200).send("Intensidad actualizada");
  });
});

// Editar dispositivo completo
app.put('/device/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { name, description, type } = req.body;
  utils.query('UPDATE Devices SET name = ?, description = ?, type = ? WHERE id = ?', [name, description, type, id], (err) => {
    if (err) return res.status(500).send("Error al actualizar el dispositivo");
    res.status(200).send("Dispositivo actualizado");
  });
});

// Eliminar dispositivo
app.delete('/devices/:id', (req, res) => {
  const id = parseInt(req.params.id);
  utils.query('DELETE FROM Devices WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error interno del servidor' });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Dispositivo no encontrado' });
    res.sendStatus(204);
  });
});

// Start server
app.listen(PORT, function () {
  console.log("NodeJS API running correctly on port", PORT);
});

//=======[ End of file ]=======================================================