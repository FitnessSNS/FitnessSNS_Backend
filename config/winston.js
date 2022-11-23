const {createLogger, format, transports} = require('winston');
const {combine, timestamp, label, printf, colorize, simple} = format;
const winstonDaily = require('winston-daily-rotate-file');
const fs = require('fs');

const env = process?.env?.NODE_ENV ?? 'development';
const logDir = 'log';

// 로그 폴더 확인 (없으면 생성)
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir)
}

// 형식 설정
const logFormat = printf(({ level, message, label, timestamp }) => {
    return `${timestamp} [${label}] ${level} | ${message}`;
});

/*
 * Log Level
 * error: 0, warn: 1, info: 2, http: 3, verbose: 4, debug: 5, silly: 6
 */
const logger = createLogger({
    format: combine(
        label({ label: env }),
        timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        logFormat
    ),
    transports: [
        new winstonDaily({
            level: 'http',
            dirname: logDir,
            filename: `%DATE%.log`,
            maxSize: '20m',
            maxFiles: '14d',
            zippedArchive: true
        }),
        new winstonDaily({
            level: 'error',
            dirname: `${logDir}/error`,
            filename: `%DATE%.error.log`,
            maxSize: '20m',
            maxFiles: '14d',
            zippedArchive: true
        })
    ],
    // uncaughtException 발생 시 로깅
    exceptionHandlers: [
        new winstonDaily({
            level: 'error',
            dirname: `${logDir}/uncaughtException`,
            filename: '%DATE%.exception.log',
            maxSize: '20m',
            maxFiles: '14d',
            zippedArchive: true
        })
    ]
});

// 실제 서비스 환경을 제외하고 콘솔 출력
if (process.env.NODE_ENV !== 'production') {
    logger.add(
        new transports.Console({
            format: combine(
                colorize(),
                simple()
            ),
            level: 'http'
        })
    );
}

module.exports = {
    logger
};