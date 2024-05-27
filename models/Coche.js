const mongoose = require('mongoose');
const {ObjectId} = require('mongoose');

const Coche = mongoose.model('Coche',
    mongoose.Schema({
            id: ObjectId,
            imagen: String,
            marca: {
                id: String,
                imagen: String,
                nombre: String,
                fundacion: String,
                fundador: String,
                tipo: String
            },
            modelo: String,
            version: String,
            año: String,
            combustible: String
    }, { versionKey: false })
)

module.exports = Coche;