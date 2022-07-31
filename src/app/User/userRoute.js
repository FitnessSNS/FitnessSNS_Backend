const user = require('./userController');
const jwtMiddleware = require('../../../config/jwtMiddleware');

module.exports = function (app) {
    // 회원 전체 조회 + 이메일로 조회 API
    // app.get('/app/users', user.getUsers);

    // JWT 검증 API
    app.get('/app/users/check', jwtMiddleware, user.getUserJwt);

    // 회원 조회 API
    app.get('/app/users/:id', jwtMiddleware, user.getUserById);
    
    // 회원가입 API
    app.route('/app/users').post(user.postUser);

    //회원 정보 수정 API
    app.route('/app/users/:id').patch(jwtMiddleware, user.patchUser);

    //회원 상태 수정 API
    app.route('/app/users/:id/status').patch(jwtMiddleware, user.patchUserStatus);

    // 로그인 하기 API
    app.route('/app/login').post(user.postLogin);
};