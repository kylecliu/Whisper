//jshint esversion:6

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const ejs = require('ejs');
const pg = require('pg');
const db = require('knex') ({
    client: 'pg',
    connection: {
    host : '127.0.0.1',
    port : 5432,
    user : 'MightyKyle',
    password : '',
    database : 'userdb'
  }
});

// console.log(process.env.SECRETE_KEY);



const app = express();

app.use(express.static('public'));
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
    extended : true
}));






app.get('/', function(req, res) {
    res.render('home');
});

app.get('/login', function(req, res) {
    res.render('login');
});

app.post('/login', function(req, res) {

    const { username, password } = req.body;

    // bcrypt.compare(password, hash, function(err, result) {
    //     // result == true
    // });

    db('users')
    .returning('*')
    .where({
        username: username
        // password: password
    })
    .then(user => {

        bcrypt.compare(password, user[0].password)
        .then(result => {
            if (result) {
                res.render('secrets');
            } else {
                res.status(400).json('Incorrect username or password');
            }
        })
        .catch(err => {
            res.status(400).json(err);
        })
    })
    .catch(err => {
        res.status(400).json(err);
    })

    // .then(response => {
    //     if (response.length != 0) {
    //         res.render('secrets');
    //     } else {
    //         res.status(400).json('Incorrect username or password');
    //     }
    // })
    // .catch(err => {
    //     res.status(400).json('Incorrect username or password');
    // })
});

app.get('/register', function(req, res) {
    res.render('register');
})

app.post('/register', function(req, res) {
    const { username, password} = req.body;

    bcrypt.hash(password, 10, function(err, hash) {
        db('users')
        .insert({
            username: username,
            password: hash
        })
        .then(() => {
            res.redirect('/login');
        })
        .catch(err => {
            res.status(400).json('Unable to register');
        });
    });
    
});

app.get('/secrets', function(req, res) {
    res.render('secrets');
})

app.get('/submit', function(req, res) {
    res.render('submit');
})

























app.listen(3000, function(req, res){
    console.log('Server up and running...')
})


