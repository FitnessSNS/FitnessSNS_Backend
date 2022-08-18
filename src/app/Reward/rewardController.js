const rewardService = require('./rewardService');
const rewardProvider = require('./rewardProvider');
const baseResponse = require('../../../config/baseResponseStatus');
const {response, errResponse} = require('../../../config/response');
const {BIGINT} = require("sequelize");

/** 챌린지 확인 API
 * [GET] /app/rewards/challenge
 * body :
 */
exports.getChallenge = async function (req, res) {
    // TODO: 사용자 인증 추가
    
    const getchallengeResult = await rewardProvider.retrieveChallenge();
    
    if (getchallengeResult === 'NoChallenges') {
        return res.send(errResponse(baseResponse.CHALLENGE_NOT_FOUND));
    }
    
    return res.send(response(baseResponse.SUCCESS, getchallengeResult));
};

/** 챌린지 등록 API
 * [POST] /app/rewards/challenge
 * body : title, content, condition, end_date
 */
exports.postChallenge = async function (req, res) {
    const { title, content, condition, end_date } = req.body;
    
    const postChallengeResult = await rewardService.createChallenge(title, content, condition, end_date)
    
    return res.send(postChallengeResult);
};