const reward = require('./rewardController');
const {authenticate} = require("../../middleware/auth");

module.exports = function (app) {
    // 챌린지 등록 API
    app.route('/rewards/challenge')
        .get(reward.getChallenge)
        .post(reward.postChallenge);
    
    // 리워드 페이지 접속
    app.route('/rewards/users').get(authenticate, reward.getUserInfo);
}