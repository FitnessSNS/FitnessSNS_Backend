const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

//passport config
const passport = require('passport');
const {initialize} = require('./passport/index');
app.use(passport.initialize());
initialize();

//routers
const auth = require('./src/app/Auth/authRoute');
app.use('/auth', auth);

//404 error handling
app.use(function(req, res, next) {
    console.log('404');
    next({status: 404, message: 'page not found'}); //404 error handling
});

//global error handling
app.use(function(err, req, res, next) {
    console.log('global error', err);
    res.status(err.status).json({message: err.message}); 
});


app.listen(port, () => {
    console.log(`Listening...`);
});
