module.exports = {
    // Success
    SUCCESS: {"isSuccess": true, "code": 1000, "message": "성공"},
    
    //Request error
    // Token
    ACCESS_TOKEN_EMPTY: {"isSuccess": false, code: 1100, message: "access token is empty"},
    ACCESS_TOKEN_VERFICATION_FAIL: {"isSuccess": false, code: 1101, message: "access token verification failed"},
    ACCESS_TOKEN_EXPIRED: {"isSuccess": false, code: 1102, message: "access token has expired"},
    REFRESH_TOKEN_EMPTY: {"isSuccess": false, code: 1110, message: "refresh token is empty"},
    REFRESH_TOKEN_VERIFICATION_FAIL: {"isSuccess": false, code: 1111, message: "refresh token verification failed"},
    REFRESH_TOKEN_EXPIRED: {"isSuccess": false, code: 1112, message: "refresh token has expired"},
    
    // Session
    IP_CHANGE_ERROR: {"isSuccess": false, code: 1200, message: "ip has changed. please re-login"},
    SESSION_EXPIRED: {"isSuccess": false, code: 1201, message: "session expired from server"},

    // User
    USER_VALIDATION_FAILURE: {"isSuccess": false, code: 2000, message: "user validation failed" },

    // Reward
    CHALLENGE_NOT_FOUND: {"isSuccess": false, code: 3001, message: "challenge cannot found" },
    
    //Connection, Transaction 등의 서버 오류
    DB_ERROR: {"isSuccess": false, "code": 9000, "message": "데이터 베이스 에러"},
    SERVER_ERROR: {"isSuccess": false, "code": 9001, "message": "서버 에러"},
}
