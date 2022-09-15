const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const {logger} = require('../../../config/winston');
const baseResponse = require('../../../config/baseResponseStatus');
const {response, errResponse} = require('../../../config/response');

// 위도, 경도 거리 계산
const getDistanceFromLatLon = async (lng1, lat1, lng2, lat2) => {
    function deg2rad(deg) {
        return deg * (Math.PI / 180);
    }
    
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);  // deg2rad below
    const dLon = deg2rad(lng2 - lng1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
     // Distance in m
    return Math.floor(R * c * 1000);
};

// Date to String 함수
const getExerciseTime = function (todayTime) {
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
};


// 챌린지 생성
exports.createChallenge = async (title, content, condition, end_date) => {
    try {
        const challenge = await prisma.Challenge.create({
            data: {
                title: title,
                content: content,
                condition: condition,
                end_date: end_date
            }
        });
    
        console.log(`new challenge : `, challenge);
    
        return response(baseResponse.SUCCESS, challenge);
    } catch (error) {
        console.log(error);
        logger.error(`createChallenge - database error\n: ${error.message} \n${JSON.stringify(error)}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};

// 운동 시작
exports.createUserRunning = async (email, longitude, latitude) => {
    try {
        // 사용자 정보 불러오기
        const user = await prisma.User.findMany({
            where: {
                email: email,
                status: 'RUN'
            }
        });
        
        // 사용자 정보가 없을 경우 에러 발생
        if (user.length < 1) {
            return errResponse(baseResponse.RUNNING_USER_NOT_FOUND);
        }
    
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
        
        // 닉네임이 없을 경우 에러 발생
        if (nickname.length < 1) {
            return errResponse(baseResponse.RUNNING_USER_NICKNAME_NOT_FOUND);
        }
        
        // 운동 위치 조회
        const userExerciseLocation = await prisma.ExerciseLocation.findMany({
            where: {
                user_id: user[0].id,
                status: 'RUN'
            }
        });
        
        // 종료하지 않은 운동 기록이 있을 경우 에러 발생
        if (userExerciseLocation.length > 0) {
            return errResponse(baseResponse.RUNNING_USER_EXERCISE_LOCATION_EXIST);
        }
        
        // 운동 위치 생성
        const exerciseLocation = await prisma.ExerciseLocation.create({
            data: {
                user_id: user[0].id,
                longitude: longitude,
                latitude: latitude
            }
        });
        
        // 날짜 비교용 오늘, 내일 날짜 생성
        const today = new Date();
        const todayYear = today.getFullYear();
        const todayMonth = today.getMonth() + 1;
        const todayDate = today.getDate();
        const todayCheck = new Date();
        todayCheck.setHours(9, 0, 0, 0);
        const tomorrowCheck = new Date(todayYear, todayMonth, todayDate + 1);
        tomorrowCheck.setHours(9, 0, 0, 0);
        
        // 운동 기록 조회
        const userExercise = await prisma.Exercise.findMany({
            where: {
                user_id: user[0].id,
                created_at: {
                    gte: todayCheck,
                    lt: tomorrowCheck
                },
                status: 'RUN'
            }
        });
        
        // 운동 기록이 없을 경우 생성
        if (userExercise.length < 1) {
            await prisma.Exercise.create({
                data: {
                    user_id: user[0].id,
                    distance: 0,
                    time: new Date(0),
                    calorie: 0
                }
            });
        }

        // 시작 시간 설정
        let hours = exerciseLocation.created_at.getHours();
        if (hours < 10) {
            hours = `0${hours}`;
        } else {
            hours = String(hours);
        }
        
        // 시작 분 설정
        let minutes = exerciseLocation.created_at.getMinutes();
        if (minutes < 10) {
            minutes = `0${minutes}`;
        } else {
            minutes = String(minutes);
        }
        
        // 시작 초 설정
        let seconds = exerciseLocation.created_at.getSeconds();
        if (seconds < 10) {
            seconds = `0${seconds}`;
        } else {
            seconds = String(seconds);
        }
        
        // 시작 시간 설정
        const startTime = `${hours}:${minutes}:${seconds}`;
       
        const result = {
            user_id: user[0].id,
            nickname: nickname[0].nickname,
            startTime: startTime
        }
    
        return response(baseResponse.SUCCESS, result);
    } catch (error) {
        console.log(error);
        logger.error(`createUserRunning - database error\n: ${error.message} \n${JSON.stringify(error)}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};

// 운동 진행
exports.createUserRunningCheck = async (email, longitude, latitude) => {
    try {
        // 사용자 정보 불러오기
        const user = await prisma.User.findMany({
            where: {
                email: email,
                status: 'RUN'
            }
        });
        
        // 사용자 정보가 없을 경우 에러 발생
        if (user.length < 1) {
            return errResponse(baseResponse.RUNNING_CHECK_USER_NOT_FOUND);
        }
    
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
        
        // 닉네임이 없을 경우 에러 발생
        if (nickname.length < 1) {
            return errResponse(baseResponse.RUNNING_CHECK_USER_NICKNAME_NOT_FOUND);
        }
        
        // 이전 운동 위치 불러오기
        const priorLocation = await prisma.ExerciseLocation.findMany({
            where: {
                user_id: user[0].id,
                status: 'RUN'
            },
            select: {
                longitude: true,
                latitude: true,
                created_at: true,
                updated_at: true
            }
        });
        
        // 이전 운동 위치가 없을 경우
        if (priorLocation.length < 1) {
            return errResponse(baseResponse.RUNNING_CHECK_PRIOR_LOCATION_NOT_FOUND);
        }
        
        // 운동 거리 간격 계산
        const distance = await getDistanceFromLatLon(priorLocation[0].longitude, priorLocation[0].latitude, longitude, latitude);
        
        // 운동 시간 간격 계산
        const today = new Date();
        const todayYear = today.getFullYear();
        const todayMonth = today.getMonth() + 1;
        const todayDate = today.getDate();
        const timeDiff = today.getTime() - priorLocation[0].updated_at.getTime();
        
        // 운동 칼로리 계산 (1 MET = 3.5ml / 60kg / 60s, 산소 1L당 5kcal)
        const met = 3.5 * 60 * timeDiff / (60 * 1000);
        const calorie = Number((3.3 * met / 1000) * 5).toFixed(4);
        
        // 운동 시간 간격이 0보다 작거나 같은 경우
        if (timeDiff <= 0) {
            return errResponse(baseResponse.RUNNING_CHECK_TIME_LESS_ZERO);
        // 운동 시간 간격이 3시간 이상일 경우
        } else if (timeDiff >= 10800000) {
            return errResponse(baseResponse.RUNNING_CHECK_TIME_OUT);
        }
        
        // 이전 운동 위치 업데이트
        const locationChange = await prisma.ExerciseLocation.updateMany({
            where: {
                user_id: user[0].id,
                status: 'RUN'
            },
            data: {
                longitude: longitude,
                latitude: latitude,
                updated_at: today
            }
        });
        
        // 운동 위치 변경이 안 될 경우 에러
        if (locationChange.length < 1) {
            return errResponse(baseResponse.RUNNING_CHECK_UPDATE_LOCATION_ERROR);
        }
        
        // 날짜 비교용 오늘, 내일 날짜 생성
        const todayCheck = new Date();
        todayCheck.setHours(9, 0, 0, 0);
        const tomorrowCheck = new Date(todayYear, todayMonth, todayDate + 1);
        tomorrowCheck.setHours(9, 0, 0, 0);
        
        // 운동 기록 조회
        const userExercise = await prisma.Exercise.findMany({
            where: {
                user_id: user[0].id,
                created_at: {
                    gte: todayCheck,
                    lt: tomorrowCheck
                },
                status: 'RUN'
            }
        });
        
        // 운동 기록이 조회 안 될 경우 에러
        if (userExercise.length < 1) {
            return errResponse(baseResponse.RUNNING_CHECK_EXERCISE_NOT_FOUND);
        }
        
        // 추가된 운동 거리, 시간 계산
        let addDistance = userExercise[0].distance + distance;
        let addTime = new Date(userExercise[0].time.getTime() + timeDiff);
        let addCalorie = Number(userExercise[0].calorie) + Number(calorie);
        let forceEnd = false;
    
        // 운동 총합 거리가 50km 이상인 경우
        if (addDistance >= 50000) {
            addDistance = 50000;
            forceEnd = true;
        }
    
        // 운동 총합 시간이 3시간 이상일 경우
        if ((userExercise[0].time.getTime() + timeDiff) >= 10800000) {
            addTime = new Date(10800000);
            forceEnd = true;
        }
    
        // 운동 기록 수정
        const exerciseChange = await prisma.Exercise.updateMany({
            where: {
                user_id: user[0].id,
                created_at: {
                    gte: todayCheck,
                    lt: tomorrowCheck
                },
                status: 'RUN'
            },
            data: {
                distance: addDistance,
                time: addTime,
                calorie: addCalorie,
                updated_at: today
            }
        });
    
        // 운동 기록이 생성/수정 안 될 경우 에러
        if (exerciseChange.length < 1) {
            return errResponse(baseResponse.RUNNING_CHECK_UPDATE_EXERCISE_ERROR);
        }
        
        // 운동 기록 재조회
        const getUserExercise = await prisma.Exercise.findMany({
            where: {
                user_id: user[0].id,
                created_at: {
                    gte: todayCheck,
                    lt: tomorrowCheck
                },
                status: 'RUN'
            }
        });
        const checkTime = getExerciseTime(timeDiff);
        const exerciseTime = getExerciseTime(getUserExercise[0].time.getTime());
    
        // 응답 객체 생성
        const result = {
            user_id: user[0].id,
            nickname: nickname[0].nickname,
            check_time: checkTime,
            challenge_goal: 5000,
            time: exerciseTime,
            distance: getUserExercise[0].distance,
            calorie: Math.floor(getUserExercise[0].calorie),
            forceEnd: forceEnd
        }
    
        return response(baseResponse.SUCCESS, result);
    } catch (error) {
        console.log(error);
        logger.error(`createUserRunningCheck - database error\n: ${error.message} \n${JSON.stringify(error)}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};

// 운동 진행 (재시작)
exports.updateUserRunningCheck = async (email, longitude, latitude) => {
    try {
        // 사용자 정보 불러오기
        const user = await prisma.User.findMany({
            where: {
                email: email,
                status: 'RUN'
            }
        });
        
        // 사용자 정보가 없을 경우 에러 발생
        if (user.length < 1) {
            return errResponse(baseResponse.RUNNING_CHECK_USER_NOT_FOUND);
        }
        
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
        
        // 닉네임이 없을 경우 에러 발생
        if (nickname.length < 1) {
            return errResponse(baseResponse.RUNNING_CHECK_USER_NICKNAME_NOT_FOUND);
        }
        
        // 오늘 날짜
        const today = new Date();
        const todayYear = today.getFullYear();
        const todayMonth = today.getMonth() + 1;
        const todayDate = today.getDate();
        
        // 이전 운동 위치 수정
        const locationChange = await prisma.ExerciseLocation.updateMany({
            where: {
                user_id: user[0].id,
                status: 'RUN'
            },
            data: {
                longitude: longitude,
                latitude: latitude,
                updated_at: today
            }
        });
        
        // 운동 위치 변경이 안 될 경우 에러
        if (locationChange.length < 1) {
            return errResponse(baseResponse.RUNNING_CHECK_UPDATE_LOCATION_ERROR);
        }
        
        // 날짜 비교용 오늘, 내일 날짜 생성
        const todayCheck = new Date();
        todayCheck.setHours(9, 0, 0, 0);
        const tomorrowCheck = new Date(todayYear, todayMonth, todayDate + 1);
        tomorrowCheck.setHours(9, 0, 0, 0);
        
        // 운동 기록 재조회
        const getUserExercise = await prisma.Exercise.findMany({
            where: {
                user_id: user[0].id,
                created_at: {
                    gte: todayCheck,
                    lt: tomorrowCheck
                },
                status: 'RUN'
            }
        });
        const exerciseTime = getExerciseTime(getUserExercise[0].time.getTime());
        
        let forceEnd = false;
        
        // 응답 객체 생성
        const result = {
            user_id: user[0].id,
            nickname: nickname[0].nickname,
            check_time: '00:00:00',
            challenge_goal: 5000,
            time: exerciseTime,
            distance: getUserExercise[0].distance,
            calorie: Math.floor(getUserExercise[0].calorie),
            forceEnd: forceEnd
        }
        
        return response(baseResponse.SUCCESS, result);
    } catch (error) {
        console.log(error);
        logger.error(`createUserRunningCheck - database error\n: ${error.message} \n${JSON.stringify(error)}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};

// 운동 일시정지
exports.updateUserRunningStop = async (email, longitude, latitude) => {
    try {
        // 사용자 정보 불러오기
        const user = await prisma.User.findMany({
            where: {
                email: email,
                status: 'RUN'
            }
        });
        
        // 사용자 정보가 없을 경우 에러 발생
        if (user.length < 1) {
            return errResponse(baseResponse.RUNNING_STOP_USER_NOT_FOUND);
        }
        
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
        
        // 닉네임이 없을 경우 에러 발생
        if (nickname.length < 1) {
            return errResponse(baseResponse.RUNNING_STOP_USER_NICKNAME_NOT_FOUND);
        }

        // 이전 운동 위치 불러오기
        const priorLocation = await prisma.ExerciseLocation.findMany({
            where: {
                user_id: user[0].id,
                status: 'RUN'
            },
            select: {
                longitude: true,
                latitude: true,
                created_at: true,
                updated_at: true
            }
        });
        
        // 이전 운동 위치가 없을 경우
        if (priorLocation.length < 1) {
            return errResponse(baseResponse.RUNNING_STOP_PRIOR_LOCATION_NOT_FOUND);
        }
        
        // 운동 거리 간격 계산
        const distance = await getDistanceFromLatLon(priorLocation[0].longitude, priorLocation[0].latitude, longitude, latitude);
        
        // 운동 시간 간격 계산
        const today = new Date();
        const todayYear = today.getFullYear();
        const todayMonth = today.getMonth() + 1;
        const todayDate = today.getDate();
        const timeDiff = today.getTime() - priorLocation[0].updated_at.getTime();
        
        // 이전 운동 위치 수정
        const locationChange = await prisma.ExerciseLocation.updateMany({
            where: {
                user_id: user[0].id,
                status: 'RUN'
            },
            data: {
                longitude: longitude,
                latitude: latitude,
                updated_at: today
            }
        });
        
        // 운동 위치 변경이 안 될 경우 에러
        if (locationChange.length < 1) {
            return errResponse(baseResponse.RUNNING_STOP_UPDATE_LOCATION_ERROR);
        }
        
        // 운동 칼로리 계산 (1 MET = 3.5ml / 60kg / 60s, 산소 1L당 5kcal)
        const met = 3.5 * 60 * timeDiff / (60 * 1000);
        const calorie = Number((3.3 * met / 1000) * 5).toFixed(4);
        
        // 운동 시간 간격이 0보다 작거나 같은 경우
        if (timeDiff <= 0) {
            return errResponse(baseResponse.RUNNING_STOP_TIME_LESS_ZERO);
        // 운동 시간 간격이 3시간 이상일 경우
        } else if (timeDiff >= 10800000) {
            return errResponse(baseResponse.RUNNING_STOP_TIME_OUT);
        }
        
        // 날짜 비교용 오늘, 내일 날짜 생성
        const todayCheck = new Date();
        todayCheck.setHours(9, 0, 0, 0);
        const tomorrowCheck = new Date(todayYear, todayMonth, todayDate + 1);
        tomorrowCheck.setHours(9, 0, 0, 0);
        
        // 운동 기록 조회
        const userExercise = await prisma.Exercise.findMany({
            where: {
                user_id: user[0].id,
                created_at: {
                    gte: todayCheck,
                    lt: tomorrowCheck
                },
                status: 'RUN'
            }
        });
        
        // 운동 기록이 조회 안 될 경우 에러
        if (userExercise.length < 1) {
            return errResponse(baseResponse.RUNNING_STOP_EXERCISE_NOT_FOUND);
        }
        
        // 추가된 운동 거리, 시간 계산
        let exerciseChange;
        let forceEnd = false;
        let addDistance = userExercise[0].distance + distance;
        let addTime = new Date(userExercise[0].time.getTime() + timeDiff);
        let addCalorie = Number(userExercise[0].calorie) + Number(calorie);
    
        // 운동 총합 거리가 50km 이상인 경우
        if (addDistance >= 50000) {
            addDistance = 50000;
            forceEnd = true;
        }
    
        // 운동 총합 시간이 3시간 이상일 경우
        if ((userExercise[0].time.getTime() + timeDiff) >= 10800000) {
            addTime = new Date(10800000);
            forceEnd = true;
        }
    
        // 운동 기록 수정
        exerciseChange = await prisma.Exercise.updateMany({
            where: {
                user_id: user[0].id,
                created_at: {
                    gte: todayCheck,
                    lt: tomorrowCheck
                },
                status: 'RUN'
            },
            data: {
                distance: addDistance,
                time: addTime,
                calorie: addCalorie,
                updated_at: today
            }
        });
    
        // 운동 기록이 생성/수정 안 될 경우 에러
        if (exerciseChange.length < 1) {
            return errResponse(baseResponse.RUNNING_STOP_UPDATE_EXERCISE_ERROR);
        }
        
        // 운동 기록 재조회
        const getUserExercise = await prisma.Exercise.findMany({
            where: {
                user_id: user[0].id,
                created_at: {
                    gte: todayCheck,
                    lt: tomorrowCheck
                },
                status: 'RUN'
            }
        });
        const checkTime = getExerciseTime(timeDiff);
        const exerciseTime = getExerciseTime(getUserExercise[0].time.getTime());
        
        // 응답 객체 생성
        const result = {
            user_id: user[0].id,
            nickname: nickname[0].nickname,
            check_time: checkTime,
            challenge_goal: 5000,
            time: exerciseTime,
            distance: getUserExercise[0].distance,
            calorie: Math.floor(getUserExercise[0].calorie),
            forceEnd: forceEnd
        }
        
        return response(baseResponse.SUCCESS, result);
    } catch (error) {
        console.log(error);
        logger.error(`createUserRunningStop - database error\n: ${error.message} \n${JSON.stringify(error)}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};

// 운동 종료
exports.updateUserRunningEnd = async (email, forceEnd, longitude, latitude) => {
    try {
        // 사용자 정보 불러오기
        const user = await prisma.User.findMany({
            where: {
                email: email,
                status: 'RUN'
            }
        });
    
        // 사용자 정보가 없을 경우 에러 발생
        if (user.length < 1) {
            return errResponse(baseResponse.RUNNING_END_USER_NOT_FOUND);
        }
    
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
    
        // 닉네임이 없을 경우 에러 발생
        if (nickname.length < 1) {
            return errResponse(baseResponse.RUNNING_END_USER_NICKNAME_NOT_FOUND);
        }
    
        // 오늘 날짜
        const today = new Date();
        const todayYear = today.getFullYear();
        const todayMonth = today.getMonth() + 1;
        const todayDate = today.getDate();
        let todayCheck, tomorrowCheck;
        let userExercise;
    
        // 강제 종료 여부 확인
        if (forceEnd) {
            // 날짜 비교용 오늘, 내일 날짜 생성
            todayCheck = new Date();
            todayCheck.setHours(9, 0, 0, 0);
            tomorrowCheck = new Date(todayYear, todayMonth, todayDate + 1);
            tomorrowCheck.setHours(9, 0, 0, 0);
            
            // 운동 기록 ID 조회
            userExercise = await prisma.Exercise.findMany({
                where: {
                    user_id: user[0].id,
                    created_at: {
                        gte: todayCheck,
                        lt: tomorrowCheck
                    },
                    status: 'RUN'
                }
            });
            
            // 이전 운동 위치 수정
            const locationChange = await prisma.ExerciseLocation.updateMany({
                where: {
                    user_id: user[0].id,
                    status: 'RUN'
                },
                data: {
                    status: 'STOP'
                }
            });
            
            // 운동 위치 변경이 안 될 경우 에러
            if (locationChange.length < 1) {
                return errResponse(baseResponse.RUNNING_END_UPDATE_LOCATION_ERROR);
            }
        
            // 운동 기록 수정 (가장 최근 위치로 저장)
            const exerciseChange = await prisma.Exercise.updateMany({
                where: {
                    user_id: user[0].id,
                    created_at: {
                        gte: todayCheck,
                        lt: tomorrowCheck
                    },
                    status: 'RUN'
                },
                data: {
                    status: 'STOP'
                }
            });
            
            // 운동 기록이 생성/수정 안 될 경우 에러
            if (exerciseChange.length < 1) {
                return errResponse(baseResponse.RUNNING_END_UPDATE_EXERCISE_ERROR);
            }
        } else {
            // 이전 운동 위치 불러오기
            const priorLocation = await prisma.ExerciseLocation.findMany({
                where: {
                    user_id: user[0].id,
                    status: 'RUN'
                },
                select: {
                    longitude: true,
                    latitude: true,
                    created_at: true,
                    updated_at: true
                }
            });
        
            // 이전 운동 위치가 없을 경우
            if (priorLocation.length < 1) {
                return errResponse(baseResponse.RUNNING_END_PRIOR_LOCATION_NOT_FOUND);
            }
            
            // 운동 거리 간격 계산
            const distance = await getDistanceFromLatLon(priorLocation[0].longitude, priorLocation[0].latitude, longitude, latitude);
        
            // 운동 시간 간격 계산
            const timeDiff = today.getTime() - priorLocation[0].updated_at.getTime();
        
            // 이전 운동 위치 수정
            const locationChange = await prisma.ExerciseLocation.updateMany({
                where: {
                    user_id: user[0].id,
                    status: 'RUN'
                },
                data: {
                    longitude: longitude,
                    latitude: latitude,
                    updated_at: today,
                    status: 'STOP'
                }
            });
        
            // 운동 위치 변경이 안 될 경우 에러
            if (locationChange.length < 1) {
                return errResponse(baseResponse.RUNNING_END_UPDATE_LOCATION_ERROR);
            }
        
            // 운동 칼로리 계산 (1 MET = 3.5ml / 60kg / 60s, 산소 1L당 5kcal)
            const met = 3.5 * 60 * timeDiff / (60 * 1000);
            const calorie = Number((3.3 * met / 1000) * 5).toFixed(4);
        
            // 운동 시간 간격이 0보다 작거나 같은 경우
            if (timeDiff <= 0) {
                return errResponse(baseResponse.RUNNING_END_TIME_LESS_ZERO);
                // 운동 시간 간격이 3시간 이상일 경우
            } else if (timeDiff >= 10800000) {
                return errResponse(baseResponse.RUNNING_END_TIME_OUT);
            }
        
            // 날짜 비교용 오늘, 내일 날짜 생성
            todayCheck = new Date();
            todayCheck.setHours(9, 0, 0, 0);
            tomorrowCheck = new Date(todayYear, todayMonth, todayDate + 1);
            tomorrowCheck.setHours(9, 0, 0, 0);
        
            // 운동 기록 조회
            userExercise = await prisma.Exercise.findMany({
                where: {
                    user_id: user[0].id,
                    created_at: {
                        gte: todayCheck,
                        lt: tomorrowCheck
                    },
                    status: 'RUN'
                }
            });
        
            // 운동 기록이 조회 안 될 경우 에러
            if (userExercise.length < 1) {
                return errResponse(baseResponse.RUNNING_END_EXERCISE_NOT_FOUND);
            }
        
            // 추가된 운동 거리, 시간 계산
            let addDistance = userExercise[0].distance + distance;
            let addTime = new Date(userExercise[0].time.getTime() + timeDiff);
            let addCalorie = Number(userExercise[0].calorie) + Number(calorie);
        
            // 운동 기록 수정
            const exerciseChange = await prisma.Exercise.updateMany({
                where: {
                    user_id: user[0].id,
                    created_at: {
                        gte: todayCheck,
                        lt: tomorrowCheck
                    },
                    status: 'RUN'
                },
                data: {
                    distance: addDistance,
                    time: addTime,
                    calorie: addCalorie,
                    updated_at: today,
                    status: 'STOP'
                }
            });
        
            // 운동 기록이 생성/수정 안 될 경우 에러
            if (exerciseChange.length < 1) {
                return errResponse(baseResponse.RUNNING_END_UPDATE_EXERCISE_ERROR);
            }
        }
    
        // 운동 기록 재조회
        const userExerciseId = userExercise[0].id;
        const getUserExercise = await prisma.Exercise.findUnique({
            where: {
                id: userExerciseId
            }
        });
        const exerciseTime = getExerciseTime(getUserExercise.time.getTime());
    
        // 응답 객체 생성
        const result = {
            user_id: user[0].id,
            nickname: nickname[0].nickname,
            challenge_goal: 5000,
            time: exerciseTime,
            distance: getUserExercise.distance,
            calorie: Math.floor(getUserExercise.calorie),
            forceEnd: forceEnd
        }
    
        return response(baseResponse.SUCCESS, result);
    } catch (error) {
        console.log(error);
        logger.error(`createUserRunningEnd - database error\n: ${error.message} \n${JSON.stringify(error)}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};