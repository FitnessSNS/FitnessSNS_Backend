const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const {logger} = require('../../../config/winston');
const baseResponse = require('../../../config/baseResponseStatus');
const {response, errResponse} = require('../../../config/response');

exports.createChallenge = async (title, content, condition, end_date) => {
    try {
        const challenge = await prisma.Challenge.create({
            data: {
                title: title,
                content: content,
                condition: condition,
                end_date: end_date
            }
        });
    
        console.log(`new challenge : `, challenge);
    
        return response(baseResponse.SUCCESS, challenge);
    } catch (error) {
        console.log(error);
        logger.error(`createChallenge - database error\n: ${error.message} \n${JSON.stringify(error)}`);
        return errResponse(baseResponse.DB_ERROR);
    }
}