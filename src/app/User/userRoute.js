const userController = require('./userController.js');
const {authenticate} = require("../../middleware/auth");

module.exports = (app) => {
    /**
     * @swagger
     * paths :
     *   /users/myPage/userInfo:
     *     post:
     *       summary: 로컬계정 비밀번호 변경
     *       tags:
     *         - user
     *       parameters:
     *         - name: x-access-token
     *           in: header
     *           description: 사용자 액세스 토큰
     *           required: true
     *           type : string
     *       requestBody:
     *         content:
     *           'application/json':
     *             schema:
     *               type: object
     *               properties:
     *                 currentPassword:
     *                   description: 현재 비밀번호
     *                   type: string
     *                 newPassword:
     *                   description: 수정 비밀번호
     *                   type: string
     *       responses:
     *         '200':
     *           description: OK
     */
    // 비밀번호 변경
    app.post('/users/myPage/userInfo', authenticate, userController.changePassword);
    
}