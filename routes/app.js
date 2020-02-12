// El comentario de abajo es para utilizar las funciones de flecha
/*jshint esversion: 6 */
var express = require('express');


// Inicializar variables 
var app = express();


// Rutas
app.get('/', (req, res, next) => {

    res.status(200).json({
        ok: true,
        mensaje: 'Peticion realizada correctamente'
    });
});

module.exports = app;