const express = require('express');

const fs = require('fs');
const path = require('path');

const { verificaTokenImg } = require('../middlewares/autenticacion');


let app = express();


app.get('/imagen/:tipo/:img', (req, res) => {


    let tipo = req.params.tipo;
    console.log(tipo);
    let img = req.params.img;

    let pathImagen = path.resolve(__dirname, `../../uploads/${ tipo }/${ img }`);

    if (fs.existsSync(pathImagen)) {
        console.log(pathImagen);
        res.send(pathImagen);
    } else {
        let noImagePath = path.resolve(__dirname, '../assets/no-image.jpg');
        res.sendFile(noImagePath);
    }

});

module.exports = app;