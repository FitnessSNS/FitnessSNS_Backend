const jwt = require('jsonwebtoken');

const db = require('../../config/db');

require('dotenv').config();


const cookieExtractor = (req)=>{
    let token = null;
    if (req&&req.cookies&&(req.cookies['jwt']!="")) token = req.cookies['jwt'];
    return token;
};

const accessTokenVerify = (token) => {
    let decoded = jwt.verify(token, process.env.JWT_KEY );     
    return decoded;
}

const authenticate = async (req, res, next) => {
    try {
        let target = cookieExtractor(req);
        if(target === null || target === undefined){
            next({status: 401, message: "unauthorized"});
            return;
        }
        let decoded = accessTokenVerify(target); 

        let user = await db.models.User.findOne({where : { email : decoded.email}});
        
        if(!user){
            next({status: 400, message: "user not exists"});
            return;
        }

        req.user = {email: user.email, name: user.name, status: user.status};
        next();
    } catch (e) {
        if(e.name=="TokenExpiredError"){
            next({status: 401, message: "token has expired"});
        }else {
            next({status: 500, message: "internal server error"});
        }
    }
}

module.exports = {
    authenticate
}