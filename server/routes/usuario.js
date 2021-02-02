const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const _ = require('underscore');
const Usuario = require('../models/usuario');
const { verificaToken } = require('../middlewares/autenticacion');

const app = express();

//verificaToken
app.get('/usuario', verificaToken, (req, res) => {


    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);

    Usuario.find({ estado: true }, 'nombre email role estado google img')
        .skip(desde)
        .limit(limite)
        .exec((err, usuarios) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            Usuario.countDocuments({ estado: true }, (err, conteo) => {

                res.json({
                    ok: true,
                    usuarios,
                    cuantos: conteo
                });

            });


        });


});

//[verificaToken, verificaAdmin_Role]
app.post('/usuario', function(req, res) {

    let body = req.body;

    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10)
    });


    usuario.save((err, usuarioDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            usuario: usuarioDB
        });


    });


});
app.put('/usuario/actualizaNombre/:id', verificaToken, function(req, res) {

    let id = req.params.id;
    let nombre = req.body.nombre;
    Usuario.findOneAndUpdate(id, { nombre }, { new: true }, (err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.json({
            ok: true,
            usuario: usuarioDB
        });

    })

});
app.put('/usuario/actualizaPassword/:id', verificaToken, function(req, res) {

    let id = req.params.id;
    let body = req.body;
    Usuario.findOneAndUpdate(id, { password: bcrypt.hashSync(body.password, 10) }, { new: true }, (err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.json({
            ok: true,
            usuario: usuarioDB
        });

    })

});

app.get('/usuario/token', (req, res, next) => {

    let token = req.get('Authorization');
    jwt.verify(token, process.env.SEED, (err, decoded) => {

        if (err) {
            return res.status(200).json({
                ok: false,
            });
        }
        let exp = decoded.exp;
        let fechaActual = new Date();
        let fechaExpiracion = new Date(exp * 1000);
        if (fechaActual > fechaExpiracion) {
            return res.status(200).json({
                ok: false,
            });
        }
        return res.status(200).json({
            ok: true,
        });

    });
});

module.exports = app;