const reward = require('./rewardController');
const {authenticate} = require("../../middleware/auth");
const {uploadExerciseImage} = require('../../middleware/exerciseImageConnector');

module.exports = (app) => {
    /**
     * @swagger
     * paths:
     *   /rewards/users:
     *     get:
     *       summary: 리워드 메인 페이지
     *       tags:
     *         - reward
     *       parameters:
     *         - name: x-access-token
     *           in: header
     *           description: 사용자 액세스 토큰
     *           required: true
     *           type : string
     *       responses:
     *         '200':
     *           description: OK
     */
    // 리워드 메인 API
    app.route('/rewards/users').get(authenticate, reward.getRewardInfo);
    
    /**
     * @swagger
     * paths:
     *   /rewards/running/exercise:
     *     get:
     *       summary: 운동 선택
     *       tags:
     *         - reward
     *       parameters:
     *         - name: x-access-token
     *           in: header
     *           description: 사용자 액세스 토큰
     *           required: true
     *           type : string
     *         - name: type
     *           in: query
     *           description: '운동 종류 (그룹운동 : G / 개인운동 : P)'
     *           required: true
     *           schema:
     *             type: string
     *       responses:
     *         '200':
     *           description: OK
     */
    // 운동 선택 API
    app.route('/rewards/running/exercise').get(authenticate, reward.checkUserExerciseGroup);
    
    /**
     * @swagger
     * paths:
     *   /rewards/running/start:
     *     post:
     *       summary: 운동 시작
     *       tags:
     *         - reward
     *       parameters:
     *         - name: x-access-token
     *           in: header
     *           description: 사용자 액세스 토큰
     *           required: true
     *           type : string
     *       requestBody:
     *         required: true
     *         content:
     *           'application/json':
     *             schema:
     *               type: object
     *               properties:
     *                 longitude:
     *                   description: 현재 위치의 경도
     *                   type: string
     *                 latitude:
     *                   description: 현재 위치의 위도
     *                   type: string
     *             example:
     *               longitude: '127.04121226963451'
     *               latitude: '37.54551935928244'
     *       responses:
     *         '200':
     *           description: OK
     */
    // 운동 시작 API
    app.route('/rewards/running/start').post(authenticate, reward.postUserRunning);
    
    /**
     * @swagger
     * paths:
     *   /rewards/running/check:
     *     post:
     *       summary: 운동 진행
     *       tags:
     *         - reward
     *       parameters:
     *         - name: x-access-token
     *           in: header
     *           description: 사용자 액세스 토큰
     *           required: true
     *           type : string
     *         - name: isRestart
     *           in: query
     *           description: 운동 일시정지 후 재시작 여부
     *           required: true
     *           schema:
     *             type: boolean
     *       requestBody:
     *         required: true
     *         content:
     *           'application/json':
     *             schema:
     *               type: object
     *               properties:
     *                 longitude:
     *                   description: 현재 위치의 경도
     *                   type: string
     *                 latitude:
     *                   description: 현재 위치의 위도
     *                   type: string
     *             example:
     *               longitude: '127.04028456049792'
     *               latitude: '37.545871069059146'
     *       responses:
     *         '200':
     *           description: OK
     */
    // 운동 진행 API
    app.route('/rewards/running/check').post(authenticate, reward.postUserRunningCheck);
    
    /**
     * @swagger
     * paths:
     *   /rewards/running/stop:
     *     post:
     *       summary: 운동 일시정지
     *       tags:
     *         - reward
     *       parameters:
     *         - name: x-access-token
     *           in: header
     *           description: 사용자 액세스 토큰
     *           required: true
     *           type : string
     *       requestBody:
     *         required: true
     *         content:
     *           'application/json':
     *             schema:
     *               type: object
     *               properties:
     *                 longitude:
     *                   description: 현재 위치의 경도
     *                   type: string
     *                 latitude:
     *                   description: 현재 위치의 위도
     *                   type: string
     *             example:
     *               longitude: '127.03916444811568'
     *               latitude: '37.54617778554935'
     *       responses:
     *         '200':
     *           description: OK
     */
    // 운동 일시정지 API
    app.route('/rewards/running/stop').post(authenticate, reward.postUserRunningStop);
    
    /**
     * @swagger
     * paths:
     *   /rewards/running/end:
     *     post:
     *       summary: 운동 종료
     *       tags:
     *         - reward
     *       parameters:
     *         - name: x-access-token
     *           in: header
     *           description: 사용자 액세스 토큰
     *           required: true
     *           type : string
     *         - name: forceEnd
     *           in: query
     *           description: 운동 강제 종료 여부
     *           required: true
     *           schema:
     *             type: boolean
     *       requestBody:
     *         required: true
     *         content:
     *           'application/json':
     *             schema:
     *               type: object
     *               properties:
     *                 longitude:
     *                   description: 현재 위치의 경도
     *                   type: string
     *                 latitude:
     *                   description: 현재 위치의 위도
     *                   type: string
     *             example:
     *               longitude: '127.03821384085329'
     *               latitude: '37.54604294715771'
     *       responses:
     *         '200':
     *           description: OK
     */
    // 운동 종료 API
    app.route('/rewards/running/end').post(authenticate, reward.postUserRunningEnd);
    
    /**
     * @swagger
     * paths:
     *   /rewards/running/proofImage:
     *     post:
     *       summary: 운동 인증 사진
     *       tags:
     *         - reward
     *       parameters:
     *         - name: x-access-token
     *           in: header
     *           description: 사용자 액세스 토큰
     *           required: true
     *           type : string
     *       requestBody:
     *         required: true
     *         content:
     *           'multipart/form-data':
     *             schema:
     *               type: object
     *               properties:
     *                 exercise_id:
     *                   description: 운동 기록 ID
     *                   type: integer
     *                 image:
     *                   type: string
     *                   format: base64
     *               example:
     *                 exercise_id: 39
     *                 image: 'exercise.jpg'
     *       responses:
     *         '200':
     *           description: OK
     */
    // 운동 사진 인증 API
    app.route('/rewards/running/proofImage')
        .post(authenticate, uploadExerciseImage.single('image'), reward.postRunningImage);
    
    
    // 챌린지 등록 API
    app.route('/rewards/challenge')
        .get(reward.getChallenge)
        .post(reward.postChallenge);
}