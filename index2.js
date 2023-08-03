const express = require('express')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')
const mongoose = require('mongoose')
const restify = require('express-restify-mongoose')
const User  = require('../models/user')
const app = express()
const router = express.Router()

app.use(bodyParser.json())
app.use(methodOverride())

mongoose.connect('mongodb://127.0.0.1:27017/database',{
    useNewUrlParser: true,
     useUnifiedTopology: true ,
    });
    restify.serve(router, User)

// restify.serve(router, mongoose.model('Customer', new mongoose.Schema({
//   name: { type: String, required: true },
//   comment: { type: String }
// })))

app.use(router)

app.listen(3001, () => {
  console.log('Express server listening on port 3000')
})

