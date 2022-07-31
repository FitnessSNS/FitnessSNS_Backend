const express = require('express');
const compression = require('compression');
const methodOverride = require('method-override');
const cors = require('cors');

module.exports = function () {
    const app = express();
    
    // cors 도메인 설정
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

    // cors 전체 허용
    // app.use(cors());
    
    app.use(cors(corsOptions));
    
    // 정적 웹페이지 추가 시 설정
    // app.use(express.static(process.cwd() + '/public'));

    require('../src/app/User/userRoute')(app);

    return app;
};