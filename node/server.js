const express = require('express');
const multer = require('multer');
const fs = require('fs');
const app = express();

app.use(express.static('uploads'));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); 
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 2846539 }
}).array('files'); 

app.post('/upload', (req, res) => {
    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            console.log("Error al cargar el archivo:", err);
            return res.status(400).send("El tamaño del archivo excede el límite permitido.");
        } else if (err) {
            console.log("Error al cargar el archivo:", err);
            return res.status(500).send("Error interno del servidor.");
        }
        if (!req.files || req.files.length === 0) { 
            return res.status(400).send("No se ha seleccionado ningún archivo.");
        }
        const fileInfos = req.files.map(file => ({
            filename: file.filename,
            originalname: file.originalname,
            size: file.size,
            mimetype: file.mimetype
        }));
        fileInfos.forEach(file => {
            console.log(file.filename);
        });
        res.send(fileInfos);
    });
});

app.listen(3000, () => {
    console.log('Servidor escuchando en el puerto 3000');
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});
