const passport = require('passport');
const { Strategy: LocalStrategy } = require('passport-local');

const db = require('../db/index');

require('dotenv').config();

function verifyUser(pwfromClient, pwfromDB){
    return pwfromClient===pwfromDB;
}

//local strategy
const localConfig = {usernameField: 'email', passwordField: 'password'};
const localVerify =  async (email, password, done) => {
    try {
        const user = await db.models.User.findOne({where: {email}});  
         
        if(!user){
            done(null, false, {message: "user not exist"});
            return;
        }
        if(verifyUser(password, user.dataValues.password)){
            done(null, { id: user.id, email : user.email, name : user.name });
        } else {
            done(null, false, {message: "password not same"});
        }
    } catch (e) {
        console.error(e);
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
