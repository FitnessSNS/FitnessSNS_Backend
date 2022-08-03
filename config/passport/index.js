const passport = require('passport');
const { Strategy: LocalStrategy } = require('passport-local');
const { ExtractJwt, Strategy: JWTStrategy } = require('passport-jwt');

require('dotenv').config();

const mockUser = {
    id : 'user1',
    password : 'password1', 
    status:'online',
};
function mockUserCheck(id){
    return new Promise((resolve, reject)=>{
        setTimeout(()=>{
            if(id === mockUser.id){
                resolve({id : mockUser.id});
            }
            else {
                resolve();
            }
        }, 1000);
    })
}
function mockUserVerify(id, password){
    return (mockUser.id === id) && (mockUser.password === password);
}

//local strategy
const localConfig = {usernameField: 'userId', passwordField: 'password'};
const localVerify =  async (userId, password, done) => {
    try {
        const user = await mockUserCheck(userId);  
        if(!user){
            done(null, false, {message: "user not exist"});
            return;
        }
        if(mockUserVerify(userId, password)){
            done(null, user);
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
