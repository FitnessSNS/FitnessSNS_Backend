const passport = require('passport');
const jwt = require('jsonwebtoken');
const db = require('../../../config/db');

require('dotenv').config();


const jwttest = async (req, res, next) => {
    try {
        res.status(200).json({msg: `${req.user.name} got the pizza. he/she is ${req.user.status}.`}); 
    } catch (e) {
        console.error(e);
        next({status: 500, message: 'internal server error'});
    }
}

const signin = async (req, res, next) => {
    try {
        passport.authenticate('local', (err, user, info) => {
            if(err){
                next({status: 500, message: 'internal server error'});
                return;
            }
            if(!user){
                next({status: 400, message: info.message});
                return;
            }
            const token = jwt.sign({ email: user.email }, process.env.JWT_KEY, { expiresIn: '1m' });
            res.cookie('jwt', token);
            res.status(200).json({ message: "your token was generated" });
        })(req,res);        
    } catch (e) {
        console.error(e);
        next({status: 500, message: 'internal server error'});
    }
}

const signout = async (req, res, next) => {
    try {
        res.clearCookie('jwt');
        res.status(200).json({message: "logout success"});
    } catch (e) {
        console.error(e);
        next({status: 500, message: 'internal server error'});
    }

}

module.exports = {jwttest, signin, signout};
