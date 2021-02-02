const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

let Schema = mongoose.Schema;

let heroeSchema = new Schema({
    nombre: { type: String, required: [true, 'El nombre es necesario'] },
    casa: { type: String, required: [true, 'La casa a la que pertenece el super heroe es necesaria'] },
    descripcion: { type: String, required: [true, 'La descripción es necesaria'] },
    aparicion: { type: Date, required: [true, 'La fecha de aparición es necesaria'] },
    img: { type: String, required: false },
    usuario: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true }
});

heroeSchema.plugin(uniqueValidator, { message: '{PATH} debe de ser único' });

module.exports = mongoose.model('Heroe', heroeSchema);