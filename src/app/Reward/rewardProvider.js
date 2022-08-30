const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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

exports.retrieveChallenge = async () => {
    const challengeRows = await prisma.Challenge.findMany();
    
    if (challengeRows.length < 1) {
        return 'NoChallenges';
    }
    
    return challengeRows;
};

exports.retrieveUserInfo = async (email) => {
    // const userCheck = await prisma.$exist.User({ email });
    
    // 사용자 정보 불러오기
    const user = await prisma.User.findMany({
        where: {
            email: email
        },
        select: {
            id: true,
            status: true
        }
    });
    
    // 사용자 닉네임 불러오기
    const nickname = await prisma.UserProfile.findMany({
        where: {
            User: {
                email: email
            }
        },
        select: {
            nickname: true
        }
    });
    
    // 사용자 리워드 정보
    const userReward = await prisma.Reward.findMany({
        where: {
            User: {
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
    for (let reward of userReward) {
        totalReward += reward.point;
    }
    
    // 오늘 날짜
    const today = new Date();
    today.setHours(9, 0, 0, 0);
    
    // 멘트 불러오기
    const todayMent = await prisma.Ment.findMany({
        where: {
            date: {
                equals: today
            }
        },
        select: {
            content: true
        }
    })
    
    // 내일 날짜
    const todayYear = today.getFullYear();
    const todayMonth = today.getMonth();
    const todayDate = today.getDate() + 1;
    const tomorrow = new Date(todayYear, todayMonth, todayDate, 9, 0, 0, 0);
    
    // 사용자 운동 정보
    const userExercise = await prisma.Exercise.findMany({
        where: {
            User: {
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
    for (let element of userExercise) {
        todayDistance += element.distance;
        todayTime += element.time.getTime();
        todayCalorie += element.calorie;
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
    
    // 챌린지 정보
    const userChallenge = await prisma.UserChallenge.findMany({
        where: {
            User: {
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
    if (userChallenge[0] !== undefined) {
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
    
    return {
        userId: user[0].id,
        userStatus: user[0].status,
        point: totalReward,
        nickname: nickname[0].nickname,
        ment: todayMent[0].content,
        activity: {
            time_stack: timeResult,
            distance_stack: todayDistance,
            calorie_stack: todayCalorie
        },
        shopping: shoppingList,
        challenge: challengeInfo
    };
}