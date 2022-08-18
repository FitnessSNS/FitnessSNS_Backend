const reward = require('./rewardController');
const {authenticate} = require("../../middleware/auth");

module.exports = function (app) {
    // 챌린지 등록 API
    app.route('/rewards/challenge')
        .get(reward.getChallenge)
        .post(reward.postChallenge);
}