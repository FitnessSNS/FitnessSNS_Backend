const regexEmail = require("regex-email");
const userProvider = require("../../app/User/userProvider");
const userService = require("../../app/User/userService");
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");

// 한글, 영어, 숫제 제외한 특수문자를 찾는 정규표현식
const specialCharacter = /[^\w\sㄱ-힣]|[\_]/g;

/** 회원 전체 조회 API
 * [GET] /app/users
 *
 * 회원 이메일 검색 조회 API
 * [GET] /app/users?word=
 * queryString : word
 */
exports.getUsers = async function (req, res) {
    const email = req.query.word;
    if (!email) {
        const getUsersResult = await userProvider.retrieveUsers();
        return res.send(response(baseResponse.SUCCESS, getUsersResult));
    } else {
        const getUsersByEmailResult = await userProvider.retrieveUsers(email);
        return res.send(response(baseResponse.SUCCESS, getUsersByEmailResult));
    }
};

/** 회원 조회 API
 * [GET] /app/users/:id
 * pathVariable : id
 */
exports.getUserById = async function (req, res) {
    const idToToken = req.verifiedToken.userInfo
    const id = req.params.id;

    if (idToToken !== id) {
        res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
    } else {
        if (!id) {
            return res.send(errResponse(baseResponse.USER_USERID_EMPTY));
        }
        const getUserByIdResult = await userProvider.retrieveUserById(id);
        return res.send(response(baseResponse.SUCCESS, getUserByIdResult));
    }
};

/** 회원가입 API
 * [POST] /app/users
 * body : sns, accessToken, nickname, phone, birthday, gender, pet, termsOfUse, location, appVersion
 */
exports.postUser = async function (req, res) {
    const {provider, accessToken, email, nickname, phone, birthday, gender,
            pet, termsOfUse, location, appVersion} = req.body;
    
    // SNS ID 불러오기
    switch (provider) {
        case 'apple':
    }
    
    // 닉네임이 공백인 경우
    if (!nickname) {
        return res.send(errResponse(baseResponse.SIGNUP_NICKNAME_EMPTY));
    // 닉네임이 7자리 이상인 경우
    } else if (nickname.length > 7) {
        return res.send(errResponse(baseResponse.SIGNUP_NICKNAME_LENGTH));
    // 닉네임에 특수문자가 포함된 경우
    } else if (specialCharacter.test(nickname)) {
        res.send(errResponse(baseResponse.SIGNUP_NICKNAME_ERROR_TYPE));
    }
    
    
    if (!password) {
        return res.send(response(baseResponse.SIGNUP_PASSWORD_EMPTY));
    }
    if (password.length < 6 || password.length > 20) {
        return res.send(response(baseResponse.SIGNUP_PASSWORD_LENGTH));
    }
    if (!nickname) {
        return res.send(response(baseResponse.SIGNUP_NICKNAME_EMPTY));
    }
    if (nickname.length > 20) {
        return res.send(response(baseResponse.SIGNUP_NICKNAME_LENGTH));
    }

    const signUpResponse = await userService.createUser(
        email,
        password,
        nickname
    );

    return res.send(signUpResponse);
};

/** 회원 정보 수정 API
 * [PATCH] /app/users/:id
 * pathVariable : id
 * body : nickname
 */
exports.patchUser = async function (req, res) {
    const idToToken = req.verifiedToken.userInfo;
    const id = req.params.id;
    const nickname = req.body.nickname;

    if (idToToken !== id) {
        res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
    } else {
        if (!nickname) {
            res.send(errResponse(baseResponse.USER_NICKNAME_EMPTY));
        }
        const patchUserResponse = await userService.editUser(id, nickname);

        return res.send(patchUserResponse);
    }
};

/** 로그인 하기 API
 * [POST] /app/login
 * body : email, passsword
 */
exports.postLogin = async function (req, res) {
    const {email, password} = req.body;

    if (!email) {
        return res.send(errResponse(baseResponse.SIGNIN_EMAIL_EMPTY));
    }
    if (email.length > 30) {
        return res.send(errResponse(baseResponse.SIGNIN_EMAIL_LENGTH));
    }
    if (!regexEmail.test(email)) {
        return res.send(errResponse(baseResponse.SIGNIN_EMAIL_ERROR_TYPE));
    }
    if (!password) {
        return res.send(errResponse(baseResponse.SIGNIN_PASSWORD_EMPTY));
    }

    const postLoginResponse = await userService.checkUserSignIn(email, password);

    return res.send(postLoginResponse);
};

/** 회원 상태 수정 API
 * [PATCH] /app/users/:id/status
 * body : status
 */
exports.patchUserStatus = async function (req, res) {
    const idToToken = req.verifiedToken.userInfo
    const id = req.params.id;
    const status = req.body.status;

    if (idToToken !== id) {
        return res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
    } else {
        if (!status) {
            return res.send(errResponse(baseResponse.USER_STATUS_EMPTY));
        }
        const patchUserStatusResponse = await userService.editUserStatus(id, status);

        return res.send(patchUserStatusResponse);
    }
};

/** JWT 토큰 검증 API
 * [GET] app/users/check
 */
exports.getUserJwt = async function (req, res) {
    const getUserJwtResult = req.verifiedToken.userInfo;
    console.log(getUserJwtResult);
    return res.send(response(baseResponse.TOKEN_VERIFICATION_SUCCESS));
};
