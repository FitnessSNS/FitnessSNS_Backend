const express = require('./config/express');

// 로깅 함수 전역변수 선언
global.customLogger = require('./config/winston').logger;

// 환경변수 불러오기
require('dotenv').config({
    // path: `.env.${process.env?.NODE_ENV ?? 'development'}`
});

// express 객체 생성
const app = express();
const port = process.env.PORT;

// 서버 시작 (IPv4)
app.listen(port, '0.0.0.0');

// 서버 시작 알림
customLogger.info(`${process.env?.NODE_ENV ?? 'development'} - runningHigh API Server Start At Port ${port}`);
