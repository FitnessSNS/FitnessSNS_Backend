const {logger} = require("../../../config/winston");
const jwt = require("jsonwebtoken");
const userProvider = require("./userProvider");
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");

// Service Create, Update, Delete 의 로직 처리
exports.createUser = async function (email, password, nickname) {
    try {
        // 이메일 중복 확인
        const checkUserEmailRows = await userProvider.checkUserEmail(email);
        if (checkUserEmailRows.length > 0) {
            return errResponse(baseResponse.SIGNUP_REDUNDANT_EMAIL);
        }

        // 닉네임 중복 확인
        const checkUserNicknameRows = await userProvider.checkUserNickname(nickname);
        if (checkUserNicknameRows.length > 0) {
            return errResponse(baseResponse.SIGNUP_REDUNDANT_NICKNAME);
        }

        // 비밀번호 암호화
        // TODO: 비밀번호 Hashing 로직 추가
        const securityData = security.saltHashPassword(password);

        const userHashedPassword = securityData.hashedPassword;
        const userSalt = securityData.salt;

        // TODO: hashedPassword, salt 모두 집어넣기
        const insertUserParams = [email, userHashedPassword, nickname];

        // Transaction 예제
        // 회원가입 동시에 Level 테이블에도 컬럼 추가
        const connection = await pool.getConnection(async (conn) => conn);
        try {
            await connection.beginTransaction(); // START TRANSACTION

            // 1) UserInfo 테이블에 데이터 추가
            const insertUserResult = await userDao.insertUser(connection, insertUserParams);
            const id = insertUserResult.insertId;

            console.log(`추가된 회원 : ${insertUserResult.insertId}`)

            // 2) UserSalt 테이블에 데이터 추가
            const insertUserSaltParams = [id, userSalt];
            await userDao.insertUserSalt(connection, insertUserSaltParams);

            // 3) Level 테이블 추가
            // await userDao.insertUserLevel(connection, userIdResult[0].insertId);

            await connection.commit(); // COMMIT
            connection.release();

            return response(baseResponse.SUCCESS);
        } catch (err) {
            connection.rollback(); //ROLLBACK
            connection.release();
            logger.error(`App - createUser Transaction error\n: ${err.message}`);
            return errResponse(baseResponse.DB_ERROR);
        }
    } catch (err) {
        logger.error(`App - createUser Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};

exports.checkUserSignIn = async function (email, password) {
    try {
        // 이메일 확인
        const checkUserEmailRows = await userProvider.checkUserEmail(email);
        if (checkUserEmailRows.length < 1) return errResponse(baseResponse.SIGNIN_USERINFO_WRONG)

        // TODO: id 가져오기
        const id = checkUserEmailRows[0].id

        // 계정 상태 확인
        const checkUserAccountRows = await userProvider.checkUserAccount(email);

        if (checkUserAccountRows[0].status === "INACTIVE") {
            return errResponse(baseResponse.SIGNIN_INACTIVE_ACCOUNT);
        } else if (checkUserAccountRows[0].status === "DELETED") {
            return errResponse(baseResponse.SIGNIN_WITHDRAWAL_ACCOUNT);
        }

        const userSecurityData = await userProvider.retrieveUserHashedPasswordAndSalt(id);

        const salt = userSecurityData.salt;
        const hashedPassword = userSecurityData.hashedPassword;

        const isValidate = security.validatePassword(password, salt, hashedPassword);
        if (isValidate === false) {
            return errResponse(baseResponse.SIGNIN_USERINFO_WRONG);
        }
        console.log(checkUserEmailRows[0].id)

        //토큰 생성 Service
        let token = await jwt.sign(
            {
                userInfo: checkUserEmailRows[0].id,
            }, // 토큰의 내용(payload)
            secret.jwtsecret, // 비밀 키
            {
                expiresIn: "1d",
                subject: "userInfo",
            } // 유효 시간은 1일
        );

        return response(baseResponse.SUCCESS, token);
    } catch (err) {
        logger.error(`App - postSignIn Service error\n: ${err.message} \n${JSON.stringify(err)}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};

exports.editUser = async function (id, nickname) {
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        await userDao.updateUser(connection, id, nickname);
        connection.release();

        return response(baseResponse.SUCCESS);
    } catch (err) {
        logger.error(`App - editUser Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
}

exports.editUserStatus = async function (id, status) {
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        await userDao.updateUserStatus(connection, id, status);
        connection.release();

        return response(baseResponse.SUCCESS);

    } catch (err) {
        logger.error(`App - editUserStatus Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
}