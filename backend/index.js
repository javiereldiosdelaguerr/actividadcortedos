const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());


const db = mysql.createPool({
    host: 'db',
    user: 'root',
    password: '1234',
    database: 'votacion',
    waitForConnections: true,
    connectionLimit: 10
});

app.get('/', (req, res) => {
    res.send('Servidor funcionando');
});

app.get('/usuarios', (req, res) => {
    db.query('SELECT * FROM usuarios', (err, result) => {
        if (err) return res.status(500).json({ error: err });
        res.json(result);
    });
});


app.post('/login', (req, res) => {
    const { correo, contrasena } = req.body;

    if (!correo || !contrasena) {
        return res.status(400).json({
            mensaje: "Faltan datos"
        });
    }

    const sql = `
        SELECT id_usuario, nombre_de_usuario, apellido_de_usuario, correo_electronico
        FROM usuarios
        WHERE correo_electronico = ? AND contrasena = ?
    `;

    db.query(sql, [correo, contrasena], (err, result) => {
        if (err) return res.status(500).json({ error: err });

        if (result.length > 0) {
            return res.json({
                mensaje: "Login correcto",
                usuario: result[0]
            });
        }

        res.status(401).json({
            mensaje: "Credenciales incorrectas"
        });
    });
});


app.post('/registro', (req, res) => {
    const { nombre, apellido, telefono, correo, contrasena } = req.body;


    if (!nombre || !apellido || !telefono || !correo || !contrasena) {
        return res.status(400).json({
            mensaje: "Todos los campos son obligatorios"
        });
    }

    const checkSql = `
        SELECT * FROM usuarios WHERE correo_electronico = ?
    `;

    db.query(checkSql, [correo], (err, result) => {
        if (err) return res.status(500).json({ error: err });

        if (result.length > 0) {
            return res.status(400).json({
                mensaje: "El correo ya está registrado"
            });
        }

        const insertSql = `
            INSERT INTO usuarios 
            (nombre_de_usuario, apellido_de_usuario, numero_de_telefono, correo_electronico, contrasena)
            VALUES (?, ?, ?, ?, ?)
        `;

        db.query(insertSql, [nombre, apellido, telefono, correo, contrasena], (err) => {
            if (err) return res.status(500).json({ error: err });

            res.json({
                mensaje: "Usuario creado correctamente"
            });
        });
    });
});

app.get('/listas', (req, res) => {
    db.query('SELECT * FROM lista_de_votacion', (err, result) => {
        if (err) return res.status(500).json({ error: err });
        res.json(result);
    });
});


app.post('/crear-lista', (req, res) => {
    const { nombre_lista, descripcion, id_usuario } = req.body;

    if (!nombre_lista || !descripcion || !id_usuario) {
        return res.status(400).json({
            mensaje: "Datos incompletos"
        });
    }

    const sql = `
        INSERT INTO lista_de_votacion 
        (nombre_lista, descripcion, id_usuario)
        VALUES (?, ?, ?)
    `;

    db.query(sql, [nombre_lista, descripcion, id_usuario], (err) => {
        if (err) return res.status(500).json({ error: err });

        res.json({
            mensaje: "Lista creada correctamente"
        });
    });
});


app.post('/crear-opcion', (req, res) => {
    const { descripcion, id_lista } = req.body;

    if (!descripcion || !id_lista) {
        return res.status(400).json({
            mensaje: "Datos incompletos"
        });
    }

    const sql = `
        INSERT INTO opciones (descripcion, id_lista)
        VALUES (?, ?)
    `;

    db.query(sql, [descripcion, id_lista], (err) => {
        if (err) return res.status(500).json({ error: err });

        res.json({
            mensaje: "Opción creada correctamente"
        });
    });
});

app.delete('/eliminar-opcion/:id', (req, res) => {
    const { id } = req.params;

    db.query(
        'DELETE FROM opciones WHERE id_opcion = ?',
        [id],
        (err) => {
            if (err) return res.status(500).json({ error: err });

            res.json({ mensaje: "Opción eliminada" });
        }
    );
});


app.get('/opciones/:id_lista', (req, res) => {
    const { id_lista } = req.params;

    db.query(
        'SELECT * FROM opciones WHERE id_lista = ?',
        [id_lista],
        (err, result) => {
            if (err) return res.status(500).json({ error: err });
            res.json(result);
        }
    );
});


app.get('/verificar-voto/:id_usuario/:id_lista', (req, res) => {
    const { id_usuario, id_lista } = req.params;

    db.query(
        'SELECT * FROM voto WHERE id_usuario = ? AND id_lista = ?',
        [id_usuario, id_lista],
        (err, result) => {
            if (err) return res.status(500).json({ error: err });

            res.json({ yaVoto: result.length > 0 });
        }
    );
});

// 🗳️ VOTAR
app.post('/votar', (req, res) => {
    const { id_usuario, id_opcion, id_lista } = req.body;

    if (!id_usuario || !id_opcion || !id_lista) {
        return res.status(400).json({
            mensaje: "Datos incompletos"
        });
    }

    const checkSql = `
        SELECT * FROM voto 
        WHERE id_usuario = ? AND id_lista = ?
    `;

    db.query(checkSql, [id_usuario, id_lista], (err, result) => {
        if (err) return res.status(500).json({ error: err });

        if (result.length > 0) {
            return res.status(400).json({
                mensaje: "Ya votaste en esta lista"
            });
        }

        const insertSql = `
            INSERT INTO voto 
            (id_usuario, id_opcion, id_lista, fecha_voto)
            VALUES (?, ?, ?, NOW())
        `;

        db.query(insertSql, [id_usuario, id_opcion, id_lista], (err) => {
            if (err) return res.status(500).json({ error: err });

            res.json({
                mensaje: "Voto registrado correctamente "
            });
        });
    });
});


app.get('/resultados/:id_lista', (req, res) => {
    const { id_lista } = req.params;

    const sql = `
        SELECT o.descripcion, COUNT(v.id_voto) AS votos
        FROM opciones o
        LEFT JOIN voto v ON o.id_opcion = v.id_opcion
        WHERE o.id_lista = ?
        GROUP BY o.id_opcion
    `;

    db.query(sql, [id_lista], (err, result) => {
        if (err) return res.status(500).json({ error: err });
        res.json(result);
    });
});


app.listen(3000, () => {
    console.log('Servidor corriendo en puerto 3000 ');
});