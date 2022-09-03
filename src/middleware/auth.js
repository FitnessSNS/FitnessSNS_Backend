const jwt = require('jsonwebtoken');

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const baseResponse = require('../../config/baseResponseStatus');
const {response, errResponse} = require('../../config/response');

require('dotenv').config();


const accessTokenExtractor = (req)=>{
    let token = null;
    if (req&&req.cookies&&(req.cookies['access_token']!="")) token = req.cookies['access_token'];
    return token;
};


const authenticate = async (req, res, next) => {
    try {
        let token = accessTokenExtractor(req);
        if(token === null || token === undefined){
            next();
            return;
        }
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_KEY); 
        } catch (e) {
            if (e.name == "TokenExpiredError") {
                res.send(response(baseResponse.ACCESS_TOKEN_EXPIRED));
                return;
            }
            next();
            return;
        }

        let user = await prisma.user.findFirst({where : { provider: decoded.provider, email : decoded.email}});
        if(!user || user.status == "DELETED" || user.status == "STOP"){
            next();
            return;
        }

        req.user = {provider: user.provider, email: user.email, name: user.name, status: user.status};
        next();
    } catch (e) {
        console.log(e);
        next({ status: 500, message: "internal server error" });
        
    }
}

module.exports = {
    authenticate
}