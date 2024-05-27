const mongoose = require('mongoose');
const {ObjectId} = require('mongoose');

const Marca = mongoose.model('Marca',
    mongoose.Schema({
            id: ObjectId,
            imagen: String,
            nombre: String,
            fundacion: String,
            fundador: String,
            tipo: String
    }, { versionKey: false })
)

module.exports = Marca;