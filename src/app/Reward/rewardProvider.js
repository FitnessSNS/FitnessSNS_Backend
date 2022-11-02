const { PrismaClient, Prisma } = require('@prisma/client');
const prisma = new PrismaClient();
const baseResponse = require('../../../config/baseResponseStatus');
const {response, errResponse} = require("../../../config/response");

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
exports.retrieveUserInfo = async (provider, email) => {
    // 사용자 정보 불러오기
    const user =  await prisma.$queryRaw(
        Prisma.sql`
            SELECT id AS userId, provider, email,
                   CAST(nickname AS CHAR) AS nickname,
                   status
            FROM User
            WHERE provider = ${provider} AND
                email = ${email};
        `
    );
    
    // 사용자 정보가 없을 경우 에러 발생
    if (user.length < 1) {
        return errResponse(baseResponse.REWARD_USER_INFO_NOT_FOUND);
    }
    
    // 사용자 리워드 정보
    const userReward = await prisma.Reward.findMany({
        where: {
            User: {
                provider: provider,
                email: email
            }
        },
        select: {
            id: true,
            point: true,
            reason: true
        }
    });
    
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
    const todayMention = await prisma.Mention.findMany({
        where: {
            date: {
                equals: today
            }
        },
        select: {
            content: true
        }
    });
    
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
    const userExercise = await prisma.Exercise.findMany({
        where: {
            User: {
                provider: provider,
                email: email
            },
            created_at: {
                gt: today,
                lt: tomorrow
            }
        },
        select: {
            id: true,
            distance: true,
            time: true,
            calorie: true
        }
    });
    
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
    const shoppingList = await prisma.Coupon.findMany({
        take: 6,
        where: {
            status: 'RUN'
        },
        select: {
            id: true,
            image: true,
            title: true,
            content: true,
            price: true
        }
    });
    
    // 쇼핑 정보가 없을 경우 에러 발생
    if (shoppingList.length < 1) {
        return errResponse(baseResponse.REWARD_SHOPPING_LIST_NOT_FOUND);
    }
    
    // 챌린지 정보
    const userChallenge = await prisma.UserChallenge.findMany({
        where: {
            User: {
                provider: provider,
                email: email
            },
            status: 'RUN'
        },
        select: {
            id: true,
            challenge_id: true,
            count: true
        }
    });
    
    // 진행중인 챌린지가 있을 경우
    let challengeInfo;
    if (userChallenge.length > 0 && userChallenge[0] !== undefined) {
        challengeInfo = await prisma.Challenge.findUnique({
            where: {
                id: userChallenge[0].challenge_id
            },
            select: {
                id: true,
                title: true,
                content: true
            }
        });
        
        // 오늘 챌린지 성공 여부 확인
        const todayChallengeCheck = await prisma.ChallengeConfirm.findMany({
            where: {
                user_challenge_id: userChallenge[0].id,
                created_at: {
                    gt: today,
                    lt: tomorrow
                }
            },
            select: {
                isSuccess: true
            }
        });
        
        if (todayChallengeCheck[0] !== undefined) {
            challengeInfo.isSuccess = todayChallengeCheck[0].isSuccess;
        } else {
            challengeInfo.isSuccess = false;
        }
    // 진행중인 챌린지가 없을 경우 챌린지 목록 불러오기
    } else {
        challengeInfo = await prisma.Challenge.findMany({
            take: 4,
            select: {
                id: true,
                title: true,
                content: true
            }
        });
    }
    
    // 챌린지 정보가 없을 경우 에러 발생
    if (challengeInfo.length < 1) {
        return errResponse(baseResponse.REWARD_CHALLENGE_INFO_NOT_FOUND);
    }
    
    const rewardMainResult = {
        userId: user[0].userId,
        userStatus: user[0].status,
        point: totalReward,
        nickname: user[0].nickname,
        ment: todayMention[0].content,
        activity: {
            time_stack: timeResult,
            distance_stack: todayDistance,
            calorie_stack: todayCalorie
        },
        shopping: shoppingList,
        challenge: challengeInfo
    };
    
    return response(baseResponse.SUCCESS, rewardMainResult);
};

// 그룹 운동 확인
exports.retrieveUserExerciseGroup = async (provider, email, type) => {
    // 사용자 그룹 참가 확인
    const userGroup = await prisma.UserGroup.findMany({
        where: {
            User: {
                provider: provider,
                email: email
            },
            status: 'RUN'
        },
        select: {
            id: true,
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