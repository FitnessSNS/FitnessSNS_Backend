const morgan = require('morgan');

// 로깅 형식 설정
const format = `:remote-addr - :remote-user | ":method :url HTTP/:http-version" | :status | :response-time ms`

// 로깅을 위한 Output Stream 옵션
const stream = {
    write: (message) => customLogger.http(message)
};

// 로깅 스킵 여부 (400미만 코드면 로깅 안함)
const skip = (_, res) => {
    if (process.env.NODE_ENV === 'production') {
        return res.statusCode < 400;
    }
    return false;
};

const morganLog = morgan(format, { stream, skip });

module.exports = {
    morganLog
};