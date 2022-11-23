const express = require('express');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const methodOverride = require('method-override');
const cors = require('cors');
const boolParser = require(`express-query-boolean`);
const {morganLog} = require('./config/morganMiddleware');

// 로깅 함수 전역변수 선언
global.customLogger = require('./config/winston').logger;

// 환경변수 불러오기
require('dotenv').config({
    path: `.env.${process?.env?.NODE_ENV ?? 'development'}`
});

// express 객체 생성
const app = express();
const port = process.env.PORT;

// passport config
const passport = require('passport');
const {localInitialize} = require('./config/passport/moduleConfig');

// cors 화이트 리스트
const whiteList = ["http://localhost:8080",
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:5555",
    "https://sosocamp.shop",
    "https://running-high.ml",
];

const corsOptions = {
    origin     : (origin, callback) => {
        if (!origin || whiteList.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
};

app.set('trust proxy', '127.0.0.1');

app.set('view engine', 'ejs')

app.use(morganLog);

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

// 서버 시작
app.listen(port);

// 서버 시작 알림
customLogger.info(`${process?.env?.NODE_ENV ?? 'development'} - runningHigh API Server Start At Port ${port}`);
