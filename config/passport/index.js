const passport = require('passport');
const { Strategy: LocalStrategy } = require('passport-local');

//const db = require('../db/index');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const {verifyUser} = require('../../src/app/Auth/authService');

require('dotenv').config();


//local strategy
const localConfig = {usernameField: 'email', passwordField: 'password'};
const localVerify =  async (email, password, done) => {
    try {
        const user = await prisma.user.findFirst({where: {
            provider: 'local',
            email,
        }});  
         
        if(!user){
            done(null, false, {message: "user not exist"});
            return;
        }
        if(user.status == "DELETED" || user.status == "STOP"){
            done(null, false, {message: "not running account"})
            return;
        }
        if(!await verifyUser(password, user.salt, user.password)){
            done(null, false, {message: "password not same"});
            return;
        }
        done(null, user);
    } catch (e) {
        console.log(e);
        done(e);
    }
}

/* jwt using passport-jwt depreciated

//jwt strategy
const cookieExtractor = (req)=>{
    let token = null;
    if (req&&req.cookies) token = req.cookies['jwt'];
    return token;
};
const jwtConfig = {
    jwtFromRequest: cookieExtractor, 
    secretOrKey: process.env.JWT_KEY
};
const jwtVerify = async (payload, done) => {
    try {
        const user = await mockUserCheck(payload.id); 
        if(!user){
            done(null, false, {message: "not valid authentication"});
            return;
        }
        done(null, user);
    } catch (e) {
        console.error(e);
        done(e);
    }
}
*/

module.exports = {
    initialize : () => {
        passport.use('local', new LocalStrategy(localConfig, localVerify));
        //passport.use('jwt', new JWTStrategy(jwtConfig, jwtVerify));
    },
    /*
    authenticate : (req, res, next) => {
        return passport.authenticate('jwt', {session: false}, (err, user, info) => {
            if(err){
                next({status: 500, message: 'internal server error'});
                return;
            }
            if(!user){
                next({status: 401, message: info.message});
                return;
            }
            req.user = user;
            next();
        })(req,res,next);
    }
    */
}
