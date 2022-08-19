module.exports = {
    // Token
    ACCESS_TOKEN_EMPTY: {code: 1100, message: "access token is empty"},
    ACCESS_TOKEN_VERFICATION_FAIL: {code: 1101, message: "access token verification failed"},
    ACCESS_TOKEN_EXPIRED: {code: 1102, message: "access token has expired"},

    REFRESH_TOKEN_EMPTY: {code: 1110, message: "refresh token is empty"},
    REFRESH_TOKEN_VERIFICATION_FAIL: {code: 1111, message: "refresh token verification failed"},
    REFRESH_TOKEN_EXPIRED: {code: 1112, message: "refresh token has expired"},

    EV_TOKEN_EMPTY: {code: 1120, message: "email was not verified"},
    EV_TOKEN_VERIFICATION_FAIL: {code: 1121, message: "ev token verification failed"},
    EV_TOKEN_EXPIRED: {code: 1122, message: "ev token expired"},
    
    // Session
    IP_CHANGE_ERROR: {code: 1200, message: "ip has changed. please re-login"},
    SESSION_EXPIRED: {code: 1201, message: "session expired from server"},

    // SignIn
    EMAIL_EMPTY: {code: 1300, message: "email empty"},
    EMAIL_VALIDATION_FAIL: {code: 1301, message: "email condition does not match"},

    // EvStart
    EMAIL_EXISTS: {code: 1400, message: "email already registered"},
    EV_VERIFICATION_COUNT_EXCEEDED: {code: 1401, message: "verification count per day exceeded"},
    // EvEnd
    EV_CREDENTIAL_EMPTY: {code: 1401, message: "email or code is empty"},
    EV_CODE_NOT_MATCH: {code: 1402, message: "code is not same"},
    EV_CODE_NOT_GENERATED: {code: 1403, message: "email verification code is not generated"},
    EV_VERIFICATION_TIMEOUT: {code: 1404, message: "email verification code is outdated"},
    // SignUp
    PASSWORD_VALIDATION_FAIL: {code: 1500, message: "password condition does not match"},
    NICKNAME_VALIDATION_FAIL: {code: 1501, message: "nickname condition does not match"},
    EV_VERIFICATION_FAIL: {code: 1502, message: "email verification process failed"},
    

    // User
    USER_VALIDATION_FAILURE: {code: 2000, message: "user validation failed" },
    
}