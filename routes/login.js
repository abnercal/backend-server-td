// El comentario de abajo es para utilizar las funciones de flecha
/*jshint esversion: 6 */

var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

var app = express();

var Usuario = require('../models/usuario');

const { OAuth2Client } = require('google-auth-library');

const GOOGLE_CLIENT_ID = require('../config/config').GOOGLE_CLIENT_ID;
const GOOGLE_SECRET = require('../config/config').GOOGLE_SECRET;


const client = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_SECRET, '');


//============================================
// Autenticacion google
//============================================

app.post('/google', (req, res) => {
    var token = req.body.token || 'XXX';

    client.verifyIdToken({
        idToken: token,
        audience: GOOGLE_CLIENT_ID // If you have multiple [CLIENT_ID_1, CLIENT_ID_2, ...]
    }, (e, login) => {
        if (e) {
            return res.status(400).json({
                ok: true,
                mensaje: 'Token no válido',
                errors: e
            });
        }


        var payload = login.getPayload();
        var userid = payload['sub'];

        Usuario.findOne({ email: payload.email }, (err, usuario) => {

            if (err) {
                return res.status(500).json({
                    ok: true,
                    mensaje: 'Error al buscar usuario - login',
                    errors: err
                });
            }

            if (usuario) {

                if (usuario.google === false) {
                    return res.status(400).json({
                        ok: true,
                        mensaje: 'Debe de usar su autenticación normal'
                    });
                } else {

                    usuario.password = ':)';

                    var token = jwt.sign({ usuario: usuario }, SEED, { expiresIn: 14400 }); // 4 horas

                    res.status(200).json({
                        ok: true,
                        usuario: usuario,
                        token: token,
                        id: usuario._id
                    });

                }

                // Si el usuario no existe por correo
            } else {

                var usuario = new Usuario();


                usuario.nombre = payload.name;
                usuario.email = payload.email;
                usuario.password = ':)';
                usuario.img = payload.picture;
                usuario.google = true;

                usuario.save((err, usuarioDB) => {

                    if (err) {
                        return res.status(500).json({
                            ok: true,
                            mensaje: 'Error al crear usuario - google',
                            errors: err
                        });
                    }


                    var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); // 4 horas

                    res.status(200).json({
                        ok: true,
                        usuario: usuarioDB,
                        token: token,
                        id: usuarioDB._id
                    });

                });

            }


        });

    });

});
//============================================
// Autenticacion normal
//============================================

app.post('/', (req, res) => {

    var body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuarios',
                errors: err
            });
        }

        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - email',
                errors: err
            });
        }

        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {

            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - password',
                errors: err
            });

        }

        // Crear un token !!!
        usuarioDB.password = ':)';

        var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); // son 4 horas

        res.status(200).json({
            ok: true,
            usuario: usuarioDB,
            token: token,
            id: usuarioDB._id
        });

    });



});


module.exports = app;