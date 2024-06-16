require('dotenv').config();

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const {response} = require("express");

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//-----------LLAMADA-SWAGGER-UTILIZACIÓN-------------
var swaggerUi = require('swagger-ui-express');
var YAML = require('yamljs');
var swaggerDocument = YAML.load('./api_doc.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


// const apiSpec = YAML.load(path.join(__dirname, 'api_doc.yaml'));
//app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(apiSpec));

//-------------LLAMADA-MONGOSE-Y-MODELS------------
const mongoose = require('mongoose');
const Contacto = require('./models/Contacto');
const Coche = require('./models/Coche');
const Marca = require('./models/Marca');
const {mongo} = require("mongoose");
console.log(process.env.MONGODB_URI);
const mongooseDB = mongoose.connect(process.env.MONGODB_URI);

if (mongooseDB) {
    console.log('MongoDB Connected!');
} else {
    console.log('Connection to MongoDB NOT FOUND!');
}

//-------------API---- ORDENADO POR LAS SIGLAS (CRUD) CREATE, READ, UPDATE y DELETE

app.get('/api/coches', async (req, res) => {
    try {
        const coches = await Coche.find()
        res.status(200).send(coches)
    } catch (e) {
        console.log(e)
        res.status(500).send('ERROR')
    }
});

app.get('/api/marcas', async (req, res) => {
    try {
        const marcas = await Marca.find()
        res.status(200).send(marcas)
    } catch (e) {
        console.log(e)
        res.status(500).send('ERROR')
    }
});

app.post('/api/coches', async (req, res) => {
    const {imagen, marca, modelo, version, año, combustible} = req.body;
    try {
        const addDocumnet = await Coche.insertMany({
            "imagen": imagen,
            "marca": marca,
            "modelo": modelo,
            "version": version,
            "año": año,
            "combustible": combustible
        })
        if (addDocumnet) {
            res.status(200)
        } else {
            res.status(404).send('Insert fail')
        }
    } catch (e) {
        console.log(e)
        res.status(500).send('ERROR')
    }
});

app.post('/api/marcas', async (req, res) => {
    const {nombre, fundacion, fundador, tipo, imagen} = req.body;
    try {
        const addDocumnet = await Marca.insertMany({
            "nombre": nombre,
            "fundacion": fundacion,
            "fundador": fundador,
            "tipo": tipo,
            "imagen": imagen
        })
        if (addDocumnet) {
            res.status(200)
        } else {
            res.status(404).send('Insert fail')
        }
    } catch (e) {
        console.log(e)
        res.status(500).send('ERROR')
    }
});

app.get('/api/marcas/:id', async (req, res) => {
    try {
        const id = req.params.id
        const marca = await Marca.findById({_id: id})
        res.status(200).send(marca)
    } catch (e) {
        console.log(e)
        res.status(500).send('ERROR')
    }
});

app.get('/api/coches/:id', async (req, res) => {
    try {
        const id = req.params.id
        const coche = await Coche.find({_id: id})
        if (coche) {
            res.status(200).send(coche)
        } else {
            res.status(404).send(`No existe coche ${id}`)
        }
    } catch (e) {
        console.log(e)
        res.status(500).send('ERROR')
    }
});


app.post('/api/marcas/:id', async (req, res) => {
    let id = req.params.id
    const {nombre, fundacion, fundador, tipo, imagen} = req.body;

    try {
        const coche = await Coche.findById({_id: id})
        if (!coche) {
            res.status(404).send('not found')
        } else {
            const updateCount = await Marca.updateOne({"_id": id},
                {
                    $set: {
                        "nombre": nombre,
                        "fundacion": fundacion,
                        "fundador": fundador,
                        "tipo": tipo,
                        "imagen": imagen
                    }
                })
            if (updateCount) {
                res.status(201).send("Ok!")
            } else {
                res.status(404).send({success: false, msg: 'Not found update of .'});
            }
        }
    } catch (e) {
        console.log(e)
        res.status(500).send({success: false, msg: e.message});
    }
});


app.post('/api/coches/:id', async (req, res) => {
    let id = req.params.id
    const {imagen, marca, modelo, version, año, combustible} = req.body;

    try {
        const marcas = await Coche.findById({_id: id})
        if (!marcas) {
            res.status(404).send('not found')
        } else {
            const updateCount = await Coche.updateOne({"_id": id},
                {
                    $set: {
                        "imagen": imagen,
                        "marca": marca,
                        "modelo": modelo,
                        "version": version,
                        "año": año,
                        "combustible": combustible
                    }
                })
            if (updateCount) {
                res.status(204).send('Update of ${id} in table Marcas is Ok!')
            } else {
                res.status(404).send({success: false, msg: 'Not found update.'});
            }
        }
    } catch (e) {
        console.log(e)
        res.status(500).send({success: false, msg: e.message});
    }
});

app.delete('/api/coches/:id', (req, res) => {
    const id = req.params.id;
    try {
        const result = Coche.findByIdAndDelete(id);
        if (result) {
            res.send('Delete of ${id} in table Coches is Ok!')
        } else {
            res.status(404).send({success: false, msg: 'Not found.'});
        }
    } catch (e) {
        console.log(e)
        res.status(500).send('ERROR' + e.message)
    }
});

app.delete('/api/marcas/:id', (req, res) => {
    const id = req.params.id;
    try {
        const result = Marca.findByIdAndDelete(id)
        if (result) {
            res.send('Delete of {id} in table Marcas is Ok!')
        } else {
            res.status(404).send({success: false, msg: 'Not found.'});
        }
    } catch (e) {
        console.log(e)
        res.status(500).send('ERROR' + e.message)
    }
});


//---------WEB----- ORDENADO POR LAS SIGLAS (CRUD) CREATE, READ, UPDATE y DELETE

app.get('/', function (req, res, next) {
    res.render('index', {title: 'BIENVENIDOS!', autor: 'Made with <3 of Jago'});
});

app.post('/contactanos/add', async (req, res) => {
    const {nombreCompleto, email, telefono, mensaje} = req.body;
    try {
        const addContact = await Contacto.insertMany({
            "nombreCompleto": nombreCompleto,
            "email": email,
            "telefono": telefono,
            "mensaje": mensaje
        });
        if (addContact) {
            res.status(201).redirect('/contactanos');
        } else {
            res.status(404).send({success: false, msg: 'Not found.'});
        }
    } catch (e) {
        res.status(500).send({success: false, msg: e.message});
    }

});


app.get('/coches/new', async (req, res) => {
    try {
        const marcas = await Marca.find()
        if (marcas) {
            res.status(200)
            const options = {
                title: 'AÑADE UN COCHE NUEVO',
                marcas: marcas
            }
            res.render('add_coche', options)
        } else {
            res.status(404).send({success: false, msg: 'Not found.'});
        }
    } catch (e) {
        console.log(e)
        res.status(500).send({success: false, msg: e.message})
    }
});

app.post('/coches/add', async (req, res) => {
    const {marca, modelo, version, año, combustible, imagen} = req.body;
    const id_marca = marca;
    try {
        const marca = await Marca.findById({_id: id_marca});
        const addDocument = await Coche.insertMany({
            "imagen": imagen,
            "marca":{
            "id": id_marca,
            "imagen": marca.imagen,
            "nombre": marca.nombre,
            "fundacion": marca.fundacion,
            "fundador": marca.fundador,
            "tipo": marca.tipo
            },
            "modelo": modelo,
            "version": version,
            "año": año,
            "combustible": combustible
        })
        if (addDocument) {
            res.status(201).redirect('/coches')
        } else {
            res.status(404).send({success: false, msg: 'not found.'});
        }
    } catch (e) {
        console.log(e)
        res.status(500).send({success: false, msg: e.message})
    }
});


app.get('/marcas/new', async (req, res) => {
    try {
        res.status(200)
        const options = {
            title: 'AÑADE UN COCHE NUEVO'
        }
        res.render('add_marca', options)
    } catch (e) {
        console.log(e)
        res.status(500).send({success: false, msg: e.message})
    }
});

app.post('/marcas/add', async (req, res) => {
    const {nombre, fundacion, fundador, tipo, imagen} = req.body;

    try {
        const addDocument = await Marca.insertMany({
            "nombre": nombre,
            "fundacion": fundacion,
            "fundador": fundador,
            "tipo": tipo,
            "imagen": imagen
        })
        if (addDocument) {
            res.status(201).redirect('/marcas')
        } else {
            res.status(404).send({success: false, msg: 'not found.'});
        }
    } catch (e) {
        console.log(e)
        res.status(500).send({success: false, msg: e.message})
    }
});


app.get('/coches', async (req, res) => {

    try {
        //const coches = await knex('coches as c')
        //  .join('marcas as m', 'c.marca', '=', 'm.id')
        // .select('c.id', 'm.nombre as marca', 'c.modelo', 'c.version', 'c.año', 'c.combustible', 'c.imagen')
        // --- DADA -> Como hago de coche.marca = marca.id para que haga el join, con la query d aqui
        const coches = await Coche.find()
        const options = {
            title: 'Lista de coches',
            coches: coches
        }
        res.render('coches', options)
    } catch (e) {
        console.log(e)
        res.status(500).send('ERROR')
    }
});

app.get('/marcas', async (req, res) => {
    try {
        const marcas = await Marca.find()
        const options = {
            title: 'Lista de Marcas',
            marcas: marcas
        }
        res.render('marcas', options)
    } catch (e) {
        console.log(e)
        res.status(500).send({msg: 'ERROR'})
    }
});

app.get('/marcas/update/:id', async (req, res) => {

    try {
        const id = req.params.id;
        const marca = await Marca.findById(id)
        if (!marca) {
            res.status(404).send({success: false, msg: 'no marca existe'});
        } else {
            const options = {
                title: 'MODIFICANDO',
                marca: marca
            }
            res.status(200)
            res.render('update_marca', options)
        }

    } catch (e) {
        console.log(e)
        res.status(500).send('ERROR ' + e)
    }
});


app.post('/marcas/update', async (req, res) => {
    const {id, nombre, fundacion, fundador, tipo, imagen} = req.body;

    try {
        const marca = await Marca.findById(id)
        if (!marca) {
            res.status(404).send('not found')
        } else {
            const updateCount = await Marca.updateOne({_id: id}, {
                $set: {"nombre": nombre, "fundacion": fundacion, "fundador": fundador, "tipo": tipo, "imagen": imagen}
            })
                await Coche.updateMany({"marca.id": id}, {
                    $set: {
                        "marca.nombre": nombre,
                        "marca.fundacion": fundacion,
                        "marca.fundador": fundador,
                        "marca.tipo": tipo,
                        "marca.imagen": imagen
                    }
                })
            if (updateCount) {
                res.status(201).redirect('/marcas')
            } else {
                res.status(404).send({success: false, msg: 'not found.'});
            }
        }
    } catch (e) {
        console.log(e)
        res.status(500).send({success: false, msg: e.message});
    }
});

app.get('/coches/update/:id', async (req, res) => {

    try {
        const id = req.params.id;
        const coche = await Coche.findById(id)
        const marcas = await Marca.find()
        if (!coche) {
            res.status(404).send({success: false, msg: 'no coche existe'});
        } else {
            const options = {
                title: 'MODIFICANDO',
                coche: coche,
                marcas: marcas
            }
            res.render('update_coche', options)
        }
    } catch (e) {
        console.log(e)
        res.status(500).send('ERROR ' + e)
    }
});


app.post('/coches/update', async (req, res) => {
    const {id, marca, modelo, version, año, combustible, imagen} = req.body;
    try {
        const coche = await Coche.findById(id)
        const id_marca = marca;
        const marcaEncontrada = await Marca.findById({_id: id_marca})
        if (!coche) {
            res.status(404).send('not found')
        } else {
            const updateCount = await Coche.updateOne({_id: id}, {
                $set: {
                    "marca": {
                        "id": id_marca,
                        "imagen": marcaEncontrada.imagen,
                        "nombre": marcaEncontrada.nombre,
                        "fundacion": marcaEncontrada.fundacion,
                        "fundador": marcaEncontrada.fundador,
                        "tipo": marcaEncontrada.tipo
                    },
                    "modelo": modelo,
                    "version": version,
                    "año": año,
                    "combustible": combustible,
                    "imagen": imagen
                }
            })
            if (updateCount) {
                res.status(201).redirect('/coches')
            } else {
                res.status(404).send({success: false, msg: 'not found.'});
            }
        }
    } catch (e) {
        console.log(e)
        res.status(500).send({success: false, msg: e.message});
    }
});


app.delete('/coches/:id', async (req, res) => {

    const id = req.params.id;
    try {
        // DELETE FROM 'Groups' WHERE id = id
        const result = await Coche.findByIdAndDelete(id)
        if (result) {
            res.status(200).redirect('/coches')
        } else {
            res.status(404).send({success: false, msg: 'Not found.'});
        }
    } catch (e) {
        console.log(e)
        res.status(500).send('ERROR' + e.message)
    }
});


app.delete('/marcas/:id', async (req, res) => {

    const id = req.params.id;
    try {
        const marcas = await Marca.findByIdAndDelete(id)
        if (marcas) {
            await Coche.updateMany({"marca.id": id}, {
                $set: {
                    "marca.id": "",
                    "marca.nombre": "Su marca fue borrada!",
                    "marca.fundacion": "",
                    "marca.fundador": "",
                    "marca.tipo": "",
                    "marca.imagen": ""
                }
            })
            res.status(200).redirect('/marcas')
        } else {
            res.status(404).send(' marcas not found')
        }
    } catch (e) {
        console.log(e)
        res.status(500).send('ERROR' + e.message)
    }
});


app.post('/contactos', async (req, res) => {
    const {nombre, email, telefono, mensaje} = req.body;
    try {
        const addContact = await knex('contactos')
            .insert({nombre, email, telefono, mensaje})
        if (addContact) {
            res.status(201).redirect('/')
        } else {
            res.status(404).send({success: false, msg: 'not found.'});
        }
    } catch (e) {
        console.log(e)
        res.status(500).send({success: false, msg: e.message})
    }
});

// ==>  WEB  - Las rutas en Web son continuas a la IP y Puerto ('localhost:300/items...')

app.get('/about', (req, res) => {
    res.status(200)
    res.render('about', {
        title: 'ABOUT'
    })
});

app.get('/contactanos', (req, res) => {
    res.status(200)
    res.render('contactanos', {
        title: 'CONTACTANOS'
    })
});


app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
