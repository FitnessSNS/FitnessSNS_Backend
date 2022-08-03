const jwt = require('jsonwebtoken');

require('dotenv').config();

const {wrapAsync} = require('../../common/index');

const mockUser = {
    id : 'user1',
    password : 'password1', 
    status: 'onine',
};
function mockUserCheck(id){
    return new Promise((resolve, reject)=>{
        setTimeout(()=>{
            if(id === mockUser.id){
                resolve({...mockUser});
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

        let user = await mockUserCheck(decoded.id);
        
        if(!user){
            next({status: 400, message: "user not exists"});
            return;
        }

        req.user = {id: user.id, status: user.status};
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