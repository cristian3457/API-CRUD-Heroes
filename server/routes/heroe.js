const express = require('express');
const Heroe = require('../models/heroe');
const { verificaToken } = require('../middlewares/autenticacion');

const app = express();

//verificaToken
app.get('/heroes/:usuario', verificaToken, (req, res) => {

    let usuario = req.params.usuario;
    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 10;
    limite = Number(limite);

    Heroe.find({ usuario }, '')
        .skip(desde)
        .limit(limite)
        .exec((err, heroes) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            Heroe.countDocuments({ usuario }, (err, conteo) => {

                res.json({
                    ok: true,
                    heroes,
                    cuantos: conteo
                });
            });
        });
});
app.get('/heroe/:heroe', verificaToken, (req, res) => {

    let id = req.params.heroe;

    Heroe.findById(id, '')
        .exec((err, heroe) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                heroe
            });
        });
});
app.get('/ultimosHeroes/:usuario', verificaToken, (req, res) => {

    let usuario = req.params.usuario;
    let desde = 0;
    desde = Number(desde);
    let limite = 5;
    limite = Number(limite);

    Heroe.find({ usuario }, 'nombre').sort({ $natural: -1 })
        .skip(desde)
        .limit(limite)
        .exec((err, heroes) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                heroes
            });
        });
});
//[verificaToken, verificaAdmin_Role]
app.post('/heroe', verificaToken, function(req, res) {

    let body = req.body;

    let heroe = new Heroe({
        nombre: body.nombre,
        casa: body.casa,
        descripcion: body.descripcion,
        aparicion: body.aparicion,
        img: body.img,
        usuario: body.usuario,
    });

    heroe.save((err, heroeDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            heroe: heroeDB
        });


    });


});
app.put('/heroe/:id', verificaToken, function(req, res) {

    let id = req.params.id;
    let body = req.body;
    let nombre = body.nombre;
    let casa = body.casa;
    let descripcion = body.descripcion;
    let aparicion = body.aparicion;
    let usuario = body.usuario;

    Heroe.findByIdAndUpdate(id, { nombre, casa, descripcion, aparicion, usuario }, (err, heroeDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.json({
            ok: true,
            heroe: heroeDB
        });

    })

});
app.delete('/heroe/:id', verificaToken, (req, res) => {
    var id = req.params.id;

    Heroe.findByIdAndRemove(id, (err, heroeBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error borrando heroe',
                errors: err
            });
        }

        if (!heroeBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error borrando heroe, no existe un heroe con ese ID',
                errors: { message: 'No existe ningun heroe con ese ID' }
            });
        }

        return res.status(200).json({
            ok: true,
            heroe: heroeBorrado
        });
    });
});

module.exports = app;