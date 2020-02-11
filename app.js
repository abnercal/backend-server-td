// Requires
var express = require('express');
var mongoose = require('mongoose');


// Inicializar variables 
var app = express();


//
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {
    //
    if (err) throw err;
    console.log('Base de datos 3000: \x1b[32m%s\x1b[0m', 'online');
});

// Rutas
app.get('/', (req, res, next) => {
    //
    res.status(200).json({
        ok: true,
        mensaje: 'Peticion realizada correctamente'
    });
});


//Escuchar peticion
app.listen(3000, () => {
    console.log('Express serve puerto 3000: \x1b[32m%s\x1b[0m', 'online');
})