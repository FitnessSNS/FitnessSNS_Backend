// node.js 모듈 추가
const express = require('express');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const methodOverride = require('method-override');
const cors = require('cors');
const {logger} = require("./config/winston");

// process.env 불러오기
require('dotenv').config();

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
    "https://www.sosocamp.shop",
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
require('./src/app/Reward/rewardRoute')(app);


// ------- GLOBAL ERROR -------
//404 error handling
app.use(function(req, res, next) {
    const error = {
        status: 404,
        message: 'Page Not Found'
    }
    
    next(error);
});

// 404 error로 대체
app.use(function(error, req, res, next) {
    logger.error(`Global error\n: ${error.message} \n${JSON.stringify(error)}`);
    
    res.status(error.status).json({message: error.message});
});

/*
//db connection
db.sequelize
    .authenticate()
    .then(() => { console.log('connected database') })
    .catch((err) => { console.error(err) });
*/

// listen 시작
app.listen(port, '0.0.0.0', () => {
    console.log(`Listening...`);
});
