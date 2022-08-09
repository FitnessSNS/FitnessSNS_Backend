module.exports = {
    // Token
    ACCESS_TOKEN_EMPTY: {code: 1100, message: "access token is empty"},
    ACCESS_TOKEN_VERFICATION_FAIL: {code: 1101, message: "access token verification failed"},
    ACCESS_TOKEN_EXPIRED: {code: 1102, message: "access token has expired"},
    REFRESH_TOKEN_EMPTY: {code: 1110, message: "refresh token is empty"},
    REFRESH_TOKEN_VERIFICATION_FAIL: {code: 1111, message: "refresh token verification failed"},
    REFRESH_TOKEN_EXPIRED: {code: 1112, message: "refresh token has expired"},
    
    // Session
    IP_CHANGE_ERROR: {code: 1200, message: "ip has changed. please re-login"},
    SESSION_EXPIRED: {code: 1201, message: "session expired from server"},

    // User
    USER_VALIDATION_FAILURE: {code: 2000, message: "user validation failed" },
}