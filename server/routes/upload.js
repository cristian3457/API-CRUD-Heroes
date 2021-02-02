var express = require('express');

var fileUpload = require('express-fileupload');
var fs = require('fs');

var app = express();

var Heroe = require('../models/heroe');

// default options
app.use(fileUpload());

app.put('/upload/:tipo/:id/:campo', (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;
    let campo = req.params.campo;
    //tipos de colecciones
    var tiposValidos = ['heroes'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de coleccion no valido',
            errors: { message: 'El tipo de coleccion no se encuentra entre los tipos validos' }
        });
    }
    //verifica si seleccionaron archivo
    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No selecciono nada',
            errors: { message: 'Debes seleccionar un archivo' }
        });
    }

    //obtener nombre del archivo
    var archivo = req.files.archivo1;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];

    //extensiones aceptadas
    var extencionesValidas = ['png', 'jpg', 'jpeg', 'PNG', 'JPG', 'JPEG'];

    if (extencionesValidas.indexOf(extensionArchivo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Extencion no valida',
            errors: { message: 'Las extenciones validas son ' + extencionesValidas.join(', ') }
        });
    }

    //nombre de archivo personalizado
    var nombreArchivo = `${ id }-${new Date().getMilliseconds()}.${extensionArchivo}`;
    //mover archivo a un path especifico
    var path = `./uploads/${ tipo }/${nombreArchivo}`;

    archivo.mv(path, err => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                errors: err
            });
        }

        if (tipo === 'heroes') {
            imagenHeroe(id, res, nombreArchivo, campo);
        }

    })
});

function imagenHeroe(id, res, nombreArchivo, campo) {
    Heroe.findById(id, (err, heroe) => {
        if (err) {
            borraArchivo(nombreArchivo, 'heroes');
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al consultar heroes',
                errors: err
            });
        }
        if (!heroe) {
            borraArchivo(nombreArchivo, 'heroes');
            return res.status(500).json({
                ok: false,
                mensaje: 'No se encontro ningun heroe con ese id',
                errors: { message: 'no se encontro ningun heroe con el id ' + id }
            });
        }
        borraArchivo(heroe.img, 'heroes');
        if (campo == 'img') {
            heroe.img = nombreArchivo;
        }

        heroe.save((err, heroeActualizado) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al actualizar heroe',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                mensaje: 'Archivo de heroe actualizada',
                heroe: heroeActualizado
            });
        });

    });
}

function borraArchivo(nombreImagen, tipo) {

    let pathImagen = `./uploads/${ tipo }/${ nombreImagen }`;
    if (fs.existsSync(pathImagen)) {
        fs.unlinkSync(pathImagen);
    }
}
module.exports = app;