//jshint esversion:6

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const ejs = require('ejs');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const session = require('express-session');
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


const app = express();

app.use(express.static('public'));
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
    extended : true
}));

app.use(session({
    secret: 'keyboard cat and mouse',
    resave: false,
    saveUninitialized: false
  }))

app.use(passport.initialize());
app.use(passport.session());


passport.serializeUser(function(user, cb) {
process.nextTick(function() {
    cb(null, { id: user.id, username: user.username, name: user.name });
});
});

passport.deserializeUser(function(user, cb) {
process.nextTick(function() {
    return cb(null, user);
});
});
  
  
passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID_GOOGLE,
    clientSecret: process.env.CLIENT_SECRET_GOOGLE,
    callbackURL: "http://localhost:3000/auth/google/secrets"
},
function(accessToken, refreshToken, profile, cb) {

    console.log(profile);

    db('users')
    .returning('*')
    .where('auth_id', profile.id)
    .then(currentUser => {
        // currentUser;

        if(currentUser.length) {
            cb(null, currentUser[0]);
        } else {
            db('users')
            .insert({
                username: profile.displayName,
                auth_id: profile.id
            })
            .then(user => {
                cb(null, user);
            })
            .catch(err => {
                cb(err);
            })
        }
    })
    .catch(err => {
        cb(err);
    });

}
));

passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: "http://localhost:3000/auth/facebook/secrets"
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log(profile);

    db('users')
    .returning('*')
    .where('auth_id', profile.id)
    .then(currentUser => {
        // currentUser;

        if(currentUser.length) {
            cb(null, currentUser[0]);
        } else {
            db('users')
            .insert({
                username: profile.displayName,
                auth_id: profile.id
            })
            .then(user => {
                cb(null, user);
            })
            .catch(err => {
                cb(err);
            })
        }
    })
    .catch(err => {
        cb(err);
    });

  }
));


  

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

app.get('/auth/google', 
    passport.authenticate('google', { scope: ['profile'] })
);

app.get('/auth/google/secrets', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/secrets');
  });


app.get('/auth/facebook',
  passport.authenticate('facebook'));

app.get('/auth/facebook/secrets',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/secrets');
  });

app.get('/register', function(req, res) {
    res.render('register');
});

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
    if (req.isAuthenticated()) {
        res.render('secrets');
    } else {
        res.redirect('/login');
    }
    
})

app.get('/submit', function(req, res) {
    res.render('submit');
})

























app.listen(3000, function(req, res){
    console.log('Server up and running...')
})


