const {PrismaClient, Prisma} = require('@prisma/client');
const prisma = new PrismaClient();
const rewardProvider = require('./rewardProvider');
const baseResponse = require('../../../config/baseResponseStatus');
const {response, errResponse} = require('../../../config/response');
const {deleteExerciseImage} = require('../../middleware/exerciseImageConnector');

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
                title    : title,
                content  : content,
                condition: condition,
                end_date : end_date
            }
        });
        
        console.log(`new challenge : `, challenge);
        
        return response(baseResponse.SUCCESS, challenge);
    } catch (error) {
        customLogger.error(`createChallenge - database error\n${error.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};

// 운동 시작
exports.startUserRunning = async (user, longitude, latitude) => {
    // 운동 위치 조회
    try {
        const userExerciseLocation = await rewardProvider.retrieveUserExerciseLocation(user.userId);
        
        // 종료하지 않은 운동 위치가 있을 경우
        if (userExerciseLocation.length > 0) {
            return errResponse(baseResponse.RUNNING_USER_EXERCISE_LOCATION_EXIST);
        }
    } catch {
        return errResponse(baseResponse.DB_ERROR);
    }
    
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
    try {
        const userExercise = await rewardProvider.retrieveUserExercise(user.userId, todayCheck, tomorrowCheck);
        
        // 종료되지 않은 운동 기록이 있을 경우
        if (userExercise.length > 0) {
            return errResponse(baseResponse.RUNNING_USER_EXERCISE_EXIST);
        }
    } catch {
        return errResponse(baseResponse.DB_ERROR);
    }
    
    try {
        // 운동 위치 생성
        const createExerciseLocation = prisma.ExerciseLocation.create({
            data: {
                user_id  : user.userId,
                longitude: longitude,
                latitude : latitude
            }
        });
        
        // 운동 기록 생성
        const createExercise = prisma.Exercise.create({
            data: {
                user_id : user.userId,
                distance: 0,
                time    : new Date(0),
                calorie : 0
            }
        });
        
        // 트랜잭션 처리
        await prisma.$transaction([createExerciseLocation, createExercise]);
    } catch (error) {
        customLogger.error(`startUserRunning - transaction error\n${error.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
    
    // 운동 기록 재조회
    let getUserExercise;
    try {
        getUserExercise = await rewardProvider.retrieveUserExercise(user.userId, todayCheck, tomorrowCheck);
    } catch {
        return errResponse(baseResponse.DB_ERROR);
    }
    
    // 조회된 운동 기록이 없을 경우
    if (getUserExercise.length < 1) {
        return errResponse(baseResponse.RUNNING_USER_EXERCISE_NOT_FOUND);
    }
    // 운동 시간 계산
    const exerciseTime = getExerciseTime(getUserExercise[0].time.getTime());
    
    // 응답 객체 생성
    const result = {
        exercise_id   : getUserExercise[0].id,
        user_id       : user.userId,
        nickname      : user.nickname,
        check_time    : '00:00:00',
        challenge_goal: 5000,
        time          : exerciseTime,
        distance      : 0,
        calorie       : 0,
        image         : getUserExercise[0].image,
        forceEnd      : false
    }
    
    return response(baseResponse.SUCCESS, result);
};

// 운동 진행
exports.checkUserRunning = async (user, longitude, latitude) => {
    // 이전 운동 위치 불러오기
    let priorLocation;
    try {
        priorLocation = await rewardProvider.retrieveUserExerciseLocation(user.userId);
    } catch {
        return errResponse(baseResponse.DB_ERROR);
    }
    
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
    
    // 날짜 비교용 오늘, 내일 날짜 생성
    const todayCheck = new Date();
    todayCheck.setHours(9, 0, 0, 0);
    const tomorrowCheck = new Date(todayYear, todayMonth, todayDate + 1);
    tomorrowCheck.setHours(9, 0, 0, 0);
    
    // 운동 기록 조회
    const userExercise = await rewardProvider.retrieveUserExercise(user.userId, todayCheck, tomorrowCheck);
    
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
    
    try {
        // 이전 운동 위치 업데이트
        const locationChange = prisma.ExerciseLocation.updateMany({
            where: {
                user_id: user.userId,
                status : 'RUN'
            },
            data : {
                longitude : longitude,
                latitude  : latitude,
                updated_at: today
            }
        });
        
        // 운동 기록 수정
        const exerciseChange = prisma.Exercise.updateMany({
            where: {
                user_id   : user.userId,
                created_at: {
                    gte: todayCheck,
                    lt : tomorrowCheck
                },
                status    : 'RUN'
            },
            data : {
                distance  : addDistance,
                time      : addTime,
                calorie   : addCalorie,
                updated_at: today
            }
        });
        
        // 트랜잭션 처리
        await prisma.$transaction([locationChange, exerciseChange]);
    } catch (error) {
        customLogger.error(`checkUserRunning - transaction error\n${error.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
    
    // 운동 기록 재조회
    let getUserExercise;
    try {
        getUserExercise = await rewardProvider.retrieveUserExercise(user.userId, todayCheck, tomorrowCheck);
    } catch {
        return errResponse(baseResponse.DB_ERROR);
    }
    
    // 조회된 운동 기록이 없을 경우
    if (getUserExercise.length < 1) {
        return errResponse(baseResponse.RUNNING_CHECK_EXERCISE_NOT_FOUND);
    }
    
    // 운동 시간 계산
    const checkTime = getExerciseTime(timeDiff);
    const exerciseTime = getExerciseTime(getUserExercise[0].time.getTime());
    
    // 응답 객체 생성
    const result = {
        exercise_id   : getUserExercise[0].id,
        user_id       : user.userId,
        nickname      : user.nickname,
        check_time    : checkTime,
        challenge_goal: 5000,
        time          : exerciseTime,
        distance      : getUserExercise[0].distance,
        calorie       : Math.floor(getUserExercise[0].calorie),
        image         : getUserExercise[0].image,
        forceEnd      : forceEnd
    }
    
    return response(baseResponse.SUCCESS, result);
};

// 운동 진행 (재시작)
exports.restartUserRunning = async (user, longitude, latitude) => {
    // 오늘 날짜
    const today = new Date();
    const todayYear = today.getFullYear();
    const todayMonth = today.getMonth() + 1;
    const todayDate = today.getDate();
    
    // 이전 운동 위치 수정
    try {
        await prisma.ExerciseLocation.updateMany({
            where: {
                user_id: user.userId,
                status : 'RUN'
            },
            data : {
                longitude : longitude,
                latitude  : latitude,
                updated_at: today
            }
        });
    } catch (error) {
        customLogger.error(`restartUserRunning - database error\n${error.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
    
    // 날짜 비교용 오늘, 내일 날짜 생성
    const todayCheck = new Date();
    todayCheck.setHours(9, 0, 0, 0);
    const tomorrowCheck = new Date(todayYear, todayMonth, todayDate + 1);
    tomorrowCheck.setHours(9, 0, 0, 0);
    
    // 운동 기록 재조회
    let getUserExercise;
    try {
        getUserExercise = await rewardProvider.retrieveUserExercise(user.userId, todayCheck, tomorrowCheck);
    } catch {
        return errResponse(baseResponse.DB_ERROR);
    }
   
    // 조회된 운동 기록이 없을 경우
    if (getUserExercise.length < 1) {
        return errResponse(baseResponse.RUNNING_CHECK_EXERCISE_NOT_FOUND);
    }
    
    // 운동 시간 계산
    const exerciseTime = getExerciseTime(getUserExercise[0].time.getTime());
    
    // 강제 종료 설정
    let forceEnd = false;
    
    // 응답 객체 생성
    const result = {
        exercise_id   : getUserExercise[0].id,
        user_id       : user.userId,
        nickname      : user.nickname,
        check_time    : '00:00:00',
        challenge_goal: 5000,
        time          : exerciseTime,
        distance      : getUserExercise[0].distance,
        calorie       : Math.floor(getUserExercise[0].calorie),
        image         : getUserExercise[0].image,
        forceEnd      : forceEnd
    }
    
    return response(baseResponse.SUCCESS, result);
};

// 운동 일시정지
exports.pauseUserRunning = async (user, longitude, latitude) => {
    // 이전 운동 위치 불러오기
    let priorLocation;
    try {
        priorLocation = await rewardProvider.retrieveUserExerciseLocation(user.userId);
    } catch {
        return errResponse(baseResponse.DB_ERROR);
    }
    
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
    let userExercise;
    try {
        userExercise = await rewardProvider.retrieveUserExercise(user.userId, todayCheck, tomorrowCheck);
    } catch {
        return errResponse(baseResponse.DB_ERROR);
    }
    
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
    
    try {
        // 이전 운동 위치 수정
        const locationChange = prisma.ExerciseLocation.updateMany({
            where: {
                user_id: user.userId,
                status : 'RUN'
            },
            data : {
                longitude : longitude,
                latitude  : latitude,
                updated_at: today
            }
        });
        
        // 운동 기록 수정
        exerciseChange = prisma.Exercise.updateMany({
            where: {
                user_id   : user.userId,
                created_at: {
                    gte: todayCheck,
                    lt : tomorrowCheck
                },
                status    : 'RUN'
            },
            data : {
                distance  : addDistance,
                time      : addTime,
                calorie   : addCalorie,
                updated_at: today
            }
        });
        
        // 트랜잭션 처리
        await prisma.$transaction([locationChange, exerciseChange]);
    } catch (error) {
        customLogger.error(`pauseUserRunning - transaction error\n${error.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
    
    // 운동 기록 재조회
    let getUserExercise;
    try {
        getUserExercise = await rewardProvider.retrieveUserExercise(user.userId, todayCheck, tomorrowCheck);
    } catch {
        return errResponse(baseResponse.DB_ERROR);
    }
    
    // 조회된 운동 기록이 없을 경우
    if (getUserExercise.length < 1) {
        return errResponse(baseResponse.RUNNING_STOP_EXERCISE_NOT_FOUND);
    }
    
    // 운동 시간 계산
    const checkTime = getExerciseTime(timeDiff);
    const exerciseTime = getExerciseTime(getUserExercise[0].time.getTime());
    
    // 응답 객체 생성
    const result = {
        exercise_id   : getUserExercise[0].id,
        user_id       : user.userId,
        nickname      : user.nickname,
        check_time    : checkTime,
        challenge_goal: 5000,
        time          : exerciseTime,
        distance      : getUserExercise[0].distance,
        calorie       : Math.floor(getUserExercise[0].calorie),
        image         : getUserExercise[0].image,
        forceEnd      : forceEnd
    }
    
    return response(baseResponse.SUCCESS, result);
};

// 운동 종료
exports.endUserRunning = async (user, forceEnd, longitude, latitude) => {
    // 오늘 날짜
    const today = new Date();
    const todayYear = today.getFullYear();
    const todayMonth = today.getMonth() + 1;
    const todayDate = today.getDate();
    
    // 날짜 비교용 오늘, 내일 날짜 생성
    const todayCheck = new Date();
    todayCheck.setHours(9, 0, 0, 0);
    const tomorrowCheck = new Date(todayYear, todayMonth, todayDate + 1);
    tomorrowCheck.setHours(9, 0, 0, 0);
    
    // 강제 종료 여부 확인
    let addDistance, addTime, addCalorie, userExercise;
    if (!forceEnd) {
        // 이전 운동 위치 불러오기
        let priorLocation;
        try {
            priorLocation = await rewardProvider.retrieveUserExerciseLocation(user.userId);
        } catch {
            return errResponse(baseResponse.DB_ERROR);
        }
        
        // 이전 운동 위치가 없을 경우
        if (priorLocation.length < 1) {
            return errResponse(baseResponse.RUNNING_END_PRIOR_LOCATION_NOT_FOUND);
        }
        
        // 운동 거리 간격 계산
        const distance = await getDistanceFromLatLon(priorLocation[0].longitude, priorLocation[0].latitude, longitude, latitude);
        
        // 운동 시간 간격 계산
        let timeDiff = today.getTime() - priorLocation[0].updated_at.getTime();
        
        // 운동 칼로리 계산 (1 MET = 3.5ml / 60kg / 60s, 산소 1L당 5kcal)
        const met = 3.5 * 60 * timeDiff / (60 * 1000);
        const calorie = Number((3.3 * met / 1000) * 5).toFixed(4);
        
        // 운동 시간 간격이 0보다 작거나 같은 경우
        if (timeDiff <= 0) {
            return errResponse(baseResponse.RUNNING_END_TIME_LESS_ZERO);
            // 운동 시간 간격이 3시간 이상일 경우
        } else if (timeDiff >= 10800000) {
            timeDiff = 10800000;
        }
        
        // 운동 기록 조회
        try {
            userExercise = await rewardProvider.retrieveUserExercise(user.userId, todayCheck, tomorrowCheck);
        } catch {
            return errResponse(baseResponse.DB_ERROR);
        }
        
        // 운동 기록이 조회 안 될 경우 에러
        if (userExercise.length < 1) {
            return errResponse(baseResponse.RUNNING_END_EXERCISE_NOT_FOUND);
        }
        
        // 추가된 운동 거리, 시간 계산
        addDistance = userExercise[0].distance + distance;
        addTime = new Date(userExercise[0].time.getTime() + timeDiff);
        addCalorie = Number(userExercise[0].calorie) + Number(calorie);
    }
    
    // 운동 위치, 운동 기록 수정 시작
    try {
        let locationChange, exerciseChange;
        
        // 강제 종료 여부 확인
        if (forceEnd) {
            // 이전 운동 위치 수정
            locationChange = prisma.ExerciseLocation.updateMany({
                where: {
                    user_id: user.userId,
                    status : 'RUN'
                },
                data : {
                    status: 'STOP'
                }
            });
            
            // 운동 기록 수정 (가장 최근 위치로 저장)
            exerciseChange = prisma.Exercise.updateMany({
                where: {
                    user_id   : user.userId,
                    created_at: {
                        gte: todayCheck,
                        lt : tomorrowCheck
                    },
                    status    : 'RUN'
                },
                data : {
                    status: 'STOP'
                }
            });
        } else {
            // 이전 운동 위치 수정
            locationChange = prisma.ExerciseLocation.updateMany({
                where: {
                    user_id: user.userId,
                    status : 'RUN'
                },
                data : {
                    longitude : longitude,
                    latitude  : latitude,
                    updated_at: today,
                    status    : 'STOP'
                }
            });
            
            // 운동 기록 수정
            exerciseChange = prisma.Exercise.updateMany({
                where: {
                    user_id   : user.userId,
                    created_at: {
                        gte: todayCheck,
                        lt : tomorrowCheck
                    },
                    status    : 'RUN'
                },
                data : {
                    distance  : addDistance,
                    time      : addTime,
                    calorie   : addCalorie,
                    updated_at: today,
                    status    : 'STOP'
                }
            });
        }
        
        // 트랜잭션 처리
        await prisma.$transaction([locationChange, exerciseChange]);
    } catch (error) {
        customLogger.error(`endUserRunning - transaction error\n${error.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
    
    // 종료 기준 측정값
    const finalDistance = addDistance ?? userExercise[0].distance;
    const finalExerciseTime = addTime ?? userExercise[0].time;
    const finalCalorie = addCalorie ?? userExercise[0].calorie;
    
    // 운동 시간 계산
    const exerciseTime = getExerciseTime(finalExerciseTime.getTime());
    
    // 응답 객체 생성
    const result = {
        exercise_id   : userExercise[0].id,
        user_id       : user.userId,
        nickname      : user.nickname,
        challenge_goal: 5000,
        time          : exerciseTime,
        distance      : finalDistance,
        calorie       : Math.floor(finalCalorie),
        image         : userExercise[0].image,
        forceEnd      : forceEnd
    }
    
    return response(baseResponse.SUCCESS, result);
};

// 운동 사진 등록
exports.createRunningImage = async (provider, email, exerciseId, imageLink) => {
    try {
        // 사용자 정보 불러오기
        const user = await rewardProvider.retrieveUserInfo(provider, email);
        
        // 사용자 정보가 없을 경우 에러 발생
        if (user.length < 1) {
            return errResponse(baseResponse.RUNNING_PROOF_USER_NOT_FOUND);
        }
        
        // 운동 기록 조회
        const userExercise = await rewardProvider.retrieveUserExerciseById(exerciseId);
        if (userExercise === null) {
            return errResponse(baseResponse.RUNNING_PROOF_EXERCISE_NOT_FOUND);
        }
        
        // 운동이 종료되지 않을 경우
        if (userExercise.status === 'RUN') {
            return errResponse(baseResponse.RUNNING_PROOF_EXERCISE_NOT_END);
        }
        
        // 운동 인증 사진 추가
        await prisma.Exercise.update({
            where  : {
                id: exerciseId,
            }, data: {
                image: imageLink
            }
        });
        
        // 운동 기록 재조회
        const getUserExerciseById = await rewardProvider.retrieveUserExerciseById(exerciseId);
        const exerciseTime = getExerciseTime(getUserExerciseById.time.getTime());
        
        // 응답 객체 생성
        const result = {
            exercise_id   : getUserExerciseById.id,
            user_id       : user[0].userId,
            nickname      : user[0].nickname,
            challenge_goal: 5000,
            time          : exerciseTime,
            distance      : getUserExerciseById.distance,
            calorie       : Math.floor(getUserExerciseById.calorie),
            image         : getUserExerciseById.image,
            forceEnd      : null
        }
        
        return response(baseResponse.SUCCESS, result);
    } catch (error) {
        // 등록된 사진 삭제
        const imageName = imageLink.slice(61);
        await deleteExerciseImage(imageName);
        
        customLogger.error(`createRunningImage - database error\n: ${error.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};