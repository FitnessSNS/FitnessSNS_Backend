const reward = require('./rewardController');
const {authenticate} = require("../../middleware/auth");

module.exports = function (app) {
    // 챌린지 등록 API
    app.route('/rewards/challenge')
        .get(reward.getChallenge)
        .post(reward.postChallenge);
    
    // 리워드 페이지 접속 API
    app.route('/rewards/users').get(authenticate, reward.getUserInfo);
    
    // 운동 선택 API
    app.route('/rewards/running/exercise').get(authenticate, reward.checkUserExerciseGroup);
    
    // 운동 시작 API
    app.route('/rewards/running/start').post(authenticate, reward.postUserRunning);
    
    // 운동 진행 API
    app.route('/rewards/running/check').post(authenticate, reward.postUserRunningCheck);
}