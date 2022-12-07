const swaggerDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');

const options = {
    swaggerDefinition: {
        openapi: '3.0.3',
        info   : {
            title      : 'runningHigh API',
            version    : '1.1.0',
            description: '러닝하이 백엔드 API'
        },
        servers: [
            {
                url        : 'http://localhost:3000',
                description: '로컬 환경'
            },
            {
                url        : 'https://www.sosocamp.shop',
                description: 'AWS EC2 서버'
            }
        ],
        basePath: '/'
    },
    apis             : ['./src/app/Auth/authRoute.js', './src/app/Reward/rewardRoute.js']
};

const specs = swaggerDoc(options);

module.exports = {
    swaggerUI,
    specs
};