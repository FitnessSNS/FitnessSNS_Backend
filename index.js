const express = require('express');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const methodOverride = require('method-override');
const cors = require('cors');
const boolParser = require(`express-query-boolean`);

// express 객체 생성
const app = express();
const port = 3000;

// process.env 불러오기
require('dotenv').config();

// passport config
const passport = require('passport');
const {localInitialize} = require('./config/passport/moduleConfig');

// cors 화이트 리스트
const whiteList = ["http://localhost:8080",
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:5555",
    "https://www.sosocamp.shop",
    "https://running-high.ml",
];

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || whiteList.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
};

app.set('view engine', 'ejs')

app.use(compression());

app.use(express.json());

app.use(express.urlencoded({extended: true}));

app.use(methodOverride());

app.use(cookieParser());

app.use(cors(corsOptions));

app.use(boolParser());

app.use(passport.initialize());
// passport local initializing
localInitialize();

// ------- Routing -------
require('./src/app/Auth/authRoute')(app);
require('./src/app/Reward/rewardRoute')(app);

// listen 시작
app.listen(port, '0.0.0.0', () => {
    console.log(`Listening...`);
});