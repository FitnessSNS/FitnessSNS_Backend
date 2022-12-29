const userController = require('./userController.js');
const {authenticate} = require("../../middleware/auth");

module.exports = (app) => {
    // 비밀번호 변경
    app.post('/users/myPage/userInfo', authenticate, userController.changePassword);
   
    // 회원탈퇴
    app.post('/users/myPage/withdrawal', authenticate, userController.withdrawalAccount);
}