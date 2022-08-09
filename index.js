// node.js 모듈 추가
const express = require('express');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const methodOverride = require('method-override');
const cors = require('cors');

//const db = require('./config/db/index');

//passport config
const passport = require('passport');
const {initialize} = require('./config/passport/index');

const auth = require('./src/app/Auth/authRoute');

// express 객체 생성
const app = express();
const port = 3000;

// cors 화이트 리스트
const whiteList = ["http://localhost:8080",
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:5555",
    "https://www.mopet.co.kr",
];

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || whiteList.indexOf(origin) !== -1) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    }
};

app.use(compression());

app.use(express.json());

app.use(express.urlencoded({extended: true}));

app.use(methodOverride());

app.use(cookieParser());

app.use(cors(corsOptions));

app.use(passport.initialize());
initialize();

app.use('/auth', auth);


// ------- Routing -------
//require('./src/app/User/userRoute')(app);



// ------- GLOBAL ERROR -------
//404 error handling
app.use(function(req, res, next) {
    console.log('404');
    next({status: 404, message: 'page not found'}); //404 error handling
});

app.use(function(err, req, res, next) {
    console.log('global error', err);
    res.status(err.status).json({message: err.message}); 
});

//db connection
/*
db.sequelize
    .authenticate()
    .then(() => { console.log('connected database') })
    .catch((err) => { console.error(err) });
    */

// listen 시작
app.listen(port, '0.0.0.0', () => {
    console.log(`Listening...`);
});
