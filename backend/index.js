const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();

// ✅ Middlewares
app.use(cors());
app.use(express.json());

// ✅ Conexión a MySQL
const db = mysql.createPool({
    host: 'db',
    user: 'root',
    password: '1234',
    database: 'votacion',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// 🟢 Ruta base
app.get('/', (req, res) => {
    res.send('Servidor funcionando 🚀');
});

// 👤 Obtener usuarios
app.get('/usuarios', (req, res) => {
    db.query('SELECT * FROM usuarios', (err, result) => {
        if (err) return res.status(500).send(err);
        res.json(result);
    });
});

// 🔐 LOGIN
app.post('/login', (req, res) => {
    const { correo, contrasena } = req.body;

    const sql = `
        SELECT id_usuario, nombre_de_usuario, apellido_de_usuario, correo_electronico
        FROM usuarios
        WHERE correo_electronico = ? AND contrasena = ?
    `;

    db.query(sql, [correo, contrasena], (err, result) => {
        if (err) return res.status(500).send(err);

        if (result.length > 0) {
            res.json({
                mensaje: "Login correcto 🔥",
                usuario: result[0]
            });
        } else {
            res.status(401).json({
                mensaje: "Credenciales incorrectas ❌"
            });
        }
    });
});

// 📝 REGISTRO DE USUARIO
app.post('/registro', (req, res) => {
    const { nombre, apellido, telefono, correo, contrasena } = req.body;

    const checkSql = `SELECT * FROM usuarios WHERE correo_electronico = ?`;

    db.query(checkSql, [correo], (err, result) => {
        if (err) return res.status(500).send(err);

        if (result.length > 0) {
            return res.status(400).json({
                mensaje: "El correo ya está registrado ❌"
            });
        }

        const insertSql = `
            INSERT INTO usuarios 
            (nombre_de_usuario, apellido_de_usuario, numero_de_telefono, correo_electronico, contrasena)
            VALUES (?, ?, ?, ?, ?)
        `;

        db.query(insertSql, [nombre, apellido, telefono, correo, contrasena], (err) => {
            if (err) return res.status(500).send(err);

            res.json({
                mensaje: "Usuario creado correctamente ✅"
            });
        });
    });
});

// 📋 LISTAS DE VOTACIÓN
app.get('/listas', (req, res) => {
    db.query('SELECT * FROM lista_de_votacion', (err, result) => {
        if (err) return res.status(500).send(err);
        res.json(result);
    });
});

// ➕ CREAR LISTA (AGREGADO)
app.post('/crear-lista', (req, res) => {
    const { nombre_lista, descripcion, id_usuario } = req.body;

    const sql = `
        INSERT INTO lista_de_votacion (nombre_lista, descripcion, id_usuario)
        VALUES (?, ?, ?)
    `;

    db.query(sql, [nombre_lista, descripcion, id_usuario], (err) => {
        if (err) return res.status(500).send(err);

        res.json({
            mensaje: "Lista creada correctamente ✅"
        });
    });
});

// 🧾 OPCIONES POR LISTA
app.get('/opciones/:id_lista', (req, res) => {
    const { id_lista } = req.params;

    db.query(
        'SELECT * FROM opciones WHERE id_lista = ?',
        [id_lista],
        (err, result) => {
            if (err) return res.status(500).send(err);
            res.json(result);
        }
    );
});

// 🗳️ VOTAR
app.post('/votar', (req, res) => {
    const { id_usuario, id_opcion, id_lista } = req.body;

    const checkSql = `
        SELECT * FROM voto 
        WHERE id_usuario = ? AND id_lista = ?
    `;

    db.query(checkSql, [id_usuario, id_lista], (err, result) => {
        if (err) return res.status(500).send(err);

        if (result.length > 0) {
            return res.status(400).json({
                mensaje: "Ya votaste en esta lista ❌"
            });
        }

        const insertSql = `
            INSERT INTO voto (id_usuario, id_opcion, id_lista, fecha_voto)
            VALUES (?, ?, ?, NOW())
        `;

        db.query(insertSql, [id_usuario, id_opcion, id_lista], (err) => {
            if (err) return res.status(500).send(err);

            res.json({
                mensaje: "Voto registrado correctamente 🗳️"
            });
        });
    });
});

// 📊 RESULTADOS
app.get('/resultados/:id_lista', (req, res) => {
    const { id_lista } = req.params;

    const sql = `
        SELECT o.descripcion, COUNT(v.id_voto) as votos
        FROM opciones o
        LEFT JOIN voto v ON o.id_opcion = v.id_opcion
        WHERE o.id_lista = ?
        GROUP BY o.id_opcion
    `;

    db.query(sql, [id_lista], (err, result) => {
        if (err) return res.status(500).send(err);
        res.json(result);
    });
});


app.listen(3000, () => {
    console.log('Servidor en puerto 3000 🚀');
});
