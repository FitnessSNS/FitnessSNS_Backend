const reward = require('./rewardController');
const {authenticate} = require("../../middleware/auth");
const {uploadExerciseImage} = require('../../middleware/exerciseImageConnector');

module.exports = (app) => {
    // 리워드 메인 API
    app.route('/rewards/users').get(authenticate, reward.getRewardInfo);
    
    // 운동 선택 API
    app.route('/rewards/running/exercise').get(authenticate, reward.checkUserExerciseGroup);
    
    // 운동 시작 API
    app.route('/rewards/running/start').post(authenticate, reward.postUserRunning);
    
    // 운동 진행 API
    app.route('/rewards/running/check').post(authenticate, reward.postUserRunningCheck);
    
    // 운동 일시정지 API
    app.route('/rewards/running/stop').post(authenticate, reward.postUserRunningStop);
    
    // 운동 종료 API
    app.route('/rewards/running/end').post(authenticate, reward.postUserRunningEnd);
    
    // 운동 사진 인증 API
    app.route('/rewards/running/proofImage')
        .post(authenticate, uploadExerciseImage.single('image'), reward.postRunningImage);
    
    
    // 챌린지 등록 API
    app.route('/rewards/challenge')
        .get(reward.getChallenge)
        .post(reward.postChallenge);
}