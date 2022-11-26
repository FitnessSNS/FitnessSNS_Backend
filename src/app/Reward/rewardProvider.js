const {PrismaClient, Prisma} = require('@prisma/client');
const prisma = new PrismaClient();
const baseResponse = require('../../../config/baseResponseStatus');
const {response, errResponse} = require("../../../config/response");
const {logger} = require('../../../config/winston');

// Date to String 함수
const getTodayTime = function (todayTime) {
    // ms 단위 절삭
    todayTime = Math.floor(todayTime / 1000);
    
    // 시간 계산
    let hours = 0, minutes = 0, seconds;
    if (todayTime >= 3600) {
        hours = Math.floor(todayTime / 3600);
        todayTime -= 3600 * hours;
    }
    
    // 분 계산
    if (todayTime >= 60) {
        minutes = Math.floor(todayTime / 60);
        todayTime -= 60 * minutes;
    }
    
    // 초 계산
    seconds = todayTime;
    
    // 문자열 반환
    let hourString, minuteString, secondString;
    if (hours >= 10) {
        hourString = String(hours);
    } else {
        hourString = `0${hours}`;
    }
    
    if (minutes >= 10) {
        minuteString = String(minutes);
    } else {
        minuteString = `0${minutes}`;
    }
    
    if (seconds >= 10) {
        secondString = String(seconds);
    } else {
        secondString = `0${seconds}`;
    }
    
    return `${hourString}:${minuteString}:${secondString}`;
}

// 챌린지 정보 불러오기
exports.retrieveChallenge = async () => {
    const challengeRows = await prisma.Challenge.findMany();
    
    if (challengeRows.length < 1) {
        return 'NoChallenges';
    }
    
    return challengeRows;
};

// 사용자 리워드 정보 불러오기
exports.retrieveRewardMain = async (userId) => {
    // 사용자 정보 불러오기
    let user;
    try {
        user = await prisma.$queryRaw(
            Prisma.sql`
                SELECT id                     AS userId,
                       provider,
                       email,
                       CAST(nickname AS CHAR) AS nickname,
                       status
                FROM User
                WHERE id = ${userId};
            `
        );
        
        // 사용자 정보가 없을 경우 에러 발생
        if (user.length < 1) {
            return errResponse(baseResponse.REWARD_USER_INFO_NOT_FOUND);
        }
    } catch (error) {
        customLogger.error(`retrieveUserInfo - user info database error\n${error.message}`);
        throw error;
    }
    
    // 사용자 리워드 정보
    let userReward;
    try {
        userReward = await prisma.Reward.findMany({
            where : {
                User: {
                    provider: user[0].provider,
                    email   : user[0].email
                }
            },
            select: {
                id    : true,
                point : true,
                reason: true
            }
        });
    } catch (error) {
        customLogger.error(`retrieveUserInfo - user reward database error\n${error.message}`);
        throw error;
    }
    
    // 리워드 포인트 총합
    let totalReward = 0;
    if (userReward.length > 0) {
        for (let reward of userReward) {
            totalReward += reward.point;
        }
    }
    
    // 오늘 날짜
    const today = new Date();
    today.setHours(9, 0, 0, 0);
    
    // 멘트 불러오기
    let todayMention;
    try {
        todayMention = await prisma.Mention.findMany({
            where : {
                date: {
                    equals: today
                }
            },
            select: {
                content: true
            }
        });
    } catch (error) {
        customLogger.error(`retrieveUserInfo - today mention database error\n${error.message}`);
        throw error;
    }
    
    // 멘트가 없을 경우 에러 발생
    if (todayMention.length < 1) {
        return errResponse(baseResponse.REWARD_MENTION_NOT_FOUND);
    }
    
    // 내일 날짜
    const todayYear = today.getFullYear();
    const todayMonth = today.getMonth();
    const todayDate = today.getDate() + 1;
    const tomorrow = new Date(todayYear, todayMonth, todayDate, 9, 0, 0, 0);
    
    // 사용자 운동 정보
    let userExercise;
    try {
        userExercise = await prisma.Exercise.findMany({
            where : {
                User      : {
                    provider: user[0].provider,
                    email   : user[0].email
                },
                created_at: {
                    gt: today,
                    lt: tomorrow
                }
            },
            select: {
                id      : true,
                distance: true,
                time    : true,
                calorie : true
            }
        });
    } catch (error) {
        customLogger.error(`retrieveUserInfo - user exercise database error\n${error.message}`);
        throw error;
    }
    
    // 운동 정보 계산
    let todayDistance = 0;
    let todayTime = 0;
    let todayCalorie = 0;
    if (userExercise.length > 0) {
        for (let exercise of userExercise) {
            todayDistance += exercise.distance;
            todayTime += exercise.time.getTime();
            todayCalorie += exercise.calorie;
        }
    }
    
    const timeResult = getTodayTime(todayTime);
    
    // 쇼핑 정보
    let shoppingList;
    try {
        shoppingList = await prisma.Coupon.findMany({
            take  : 6,
            where : {
                status: 'RUN'
            },
            select: {
                id     : true,
                image  : true,
                title  : true,
                content: true,
                price  : true
            }
        });
    } catch (error) {
        customLogger.error(`retrieveUserInfo - shopping list database error\n${error.message}`);
        throw error;
    }
    
    // 쇼핑 정보가 없을 경우 에러 발생
    if (shoppingList.length < 1) {
        return errResponse(baseResponse.REWARD_SHOPPING_LIST_NOT_FOUND);
    }
    
    // 챌린지 정보
    let userChallenge;
    try {
        userChallenge = await prisma.UserChallenge.findMany({
            where : {
                User  : {
                    provider: user[0].provider,
                    email   : user[0].email
                },
                status: 'RUN'
            },
            select: {
                id          : true,
                challenge_id: true,
                count       : true
            }
        });
    } catch (error) {
        customLogger.error(`retrieveUserInfo - user challenge database error\n${error.message}`);
        throw error;
    }
    
    // 진행중인 챌린지가 있을 경우
    let challengeInfo;
    if (userChallenge.length > 0 && userChallenge[0] !== undefined) {
        try {
            challengeInfo = await prisma.Challenge.findUnique({
                where : {
                    id: userChallenge[0].challenge_id
                },
                select: {
                    id     : true,
                    title  : true,
                    content: true
                }
            });
        } catch (error) {
            customLogger.error(`retrieveUserInfo - challenge database error\n${error.message}`);
            throw error;
        }
        
        // 오늘 챌린지 성공 여부 확인
        let todayChallengeCheck;
        try {
            todayChallengeCheck = await prisma.ChallengeConfirm.findMany({
                where : {
                    user_challenge_id: userChallenge[0].id,
                    created_at       : {
                        gt: today,
                        lt: tomorrow
                    }
                },
                select: {
                    isSuccess: true
                }
            });
        } catch (error) {
            customLogger.error(`retrieveUserInfo - challenge confirm database error\n${error.message}`);
            throw error;
        }
        
        if (todayChallengeCheck[0] !== undefined) {
            challengeInfo.isSuccess = todayChallengeCheck[0].isSuccess;
        } else {
            challengeInfo.isSuccess = false;
        }
    } else {
        // 진행중인 챌린지가 없을 경우 챌린지 목록 불러오기
        try {
            challengeInfo = await prisma.Challenge.findMany({
                take  : 4,
                select: {
                    id     : true,
                    title  : true,
                    content: true
                }
            });
        } catch (error) {
            customLogger.error(`retrieveUserInfo - challenge database error\n${error.message}`);
            throw error;
        }
    }
    
    // 챌린지 정보가 없을 경우 에러 발생
    if (challengeInfo.length < 1) {
        return errResponse(baseResponse.REWARD_CHALLENGE_INFO_NOT_FOUND);
    }
    
    // 응답 객체 생성
    const rewardMainResult = {
        userId    : user[0].userId,
        userStatus: user[0].status,
        point     : totalReward,
        nickname  : user[0].nickname,
        ment      : todayMention[0].content,
        activity  : {
            time_stack    : timeResult,
            distance_stack: todayDistance,
            calorie_stack : todayCalorie
        },
        shopping  : shoppingList,
        challenge : challengeInfo
    };
    
    return response(baseResponse.SUCCESS, rewardMainResult);
};

// 그룹 운동 확인
exports.retrieveUserExerciseGroup = async (userId, type) => {
    // 사용자 그룹 참가 확인
    const userGroup = await prisma.UserGroup.findMany({
        where : {
            User  : {
                id: userId
            },
            status: 'RUN'
        },
        select: {
            id      : true,
            group_id: true,
        }
    });
    
    // 그룹 운동 가능 여부
    if (userGroup.length < 1 && type === 'G') {
        return errResponse(baseResponse.REWARD_EXERCISE_USER_GROUP_CHECK);
    } else {
        return response(baseResponse.SUCCESS);
    }
};

// 사용자 정보 조회
exports.retrieveUserInfo = async (provider, email) => {
    try {
        return await prisma.$queryRaw(
            Prisma.sql`
                SELECT id                     AS userId,
                       provider,
                       email,
                       CAST(nickname AS CHAR) AS nickname,
                       status
                FROM User
                WHERE provider = ${provider}
                  AND email = ${email};
            `
        );
    } catch (error) {
        customLogger.error(`retrieveUserInfo - database error`);
        throw error;
    }
};

// 사용자 운동 위치 조회
exports.retrieveUserExerciseLocation = async (userId) => {
    try {
        return await prisma.ExerciseLocation.findMany({
            where: {
                user_id: userId,
                status : 'RUN'
            }
        });
    } catch (error) {
        logger.error(`retrieveUserExerciseLocation - database error`);
        throw error;
    }
};


// 사용자 운동 기록 조회
exports.retrieveUserExercise = async (userId, today, tomorrow) => {
    try {
        return await prisma.Exercise.findMany({
            where: {
                user_id   : userId,
                created_at: {
                    gte: today,
                    lt : tomorrow
                },
                status    : 'RUN'
            }
        });
    } catch (error) {
        logger.error(`retrieveUserExercise - database error`);
        throw error;
    }
};

// 사용자 운동 기록 조회 (운동 기록 ID)
exports.retrieveUserExerciseById = async (exerciseId) => {
    try {
        return await prisma.Exercise.findUnique({
            where: {
                id: exerciseId
            }
        });
    } catch (error) {
        logger.error(`retrieveUserExerciseById - database error`);
        throw error;
    }
};