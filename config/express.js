const express = require('express');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const methodOverride = require('method-override');
const cors = require('cors');
const boolParser = require(`express-query-boolean`);
const {morganLog} = require('./morganMiddleware');
const swaggerUI = require('swagger-ui-express');
const YAML = require('js-yaml');
const fs = require('fs');
const path = require("path");

module.exports = () => {
    // app 시작
    const app = express();
    
    // passport config
    const passport = require('passport');
    const {localInitialize} = require('./passport/moduleConfig');

    // cors 화이트 리스트
    const whiteList = ["http://localhost:8080",
        "http://localhost:3000",
        "https://www.sosocamp.shop",
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

    // Swagger 설정 파일 불러오기
    const swaggerYAML = YAML.load(fs.readFileSync(path.join(__dirname, './swagger.yaml'), 'utf8'));
    
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
    
    // passport local initializing
    app.use(passport.initialize());
    localInitialize();

    // Swagger API
    app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerYAML));

    // ------- Routing -------
    require('../src/app/Auth/authRoute')(app);
    require('../src/app/Reward/rewardRoute')(app);
    require('../src/app/User/userRoute')(app);
    
    return app;
}