const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);
// Database
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGO_DB, { useNewUrlParser: true });
let db = mongoose.connection;
db.once('open', () => {
    console.log('DB connected!');
});
db.on('error', err => {
    console.log('DB ERROR: ', err);
});


// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'content-type, x-access-token');
    next();
});


// API
app.use('/api/users', require('./api/users'));
app.use('/api/auth', require('./api/auth'));


// Server
const port = 3000;
app.listen(port, () => {
    console.log('listening on port: ' + port);
});