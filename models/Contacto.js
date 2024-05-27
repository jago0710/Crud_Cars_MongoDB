const mongoose = require('mongoose');
const {ObjectId} = require('mongoose');

const Contacto = mongoose.model('Contacto',
    mongoose.Schema({
        id: ObjectId,
        nombre: String,
        email: String,
        telefono: String,
        mensaje: String
    }, { versionKey: false })
)

module.exports = Contacto;