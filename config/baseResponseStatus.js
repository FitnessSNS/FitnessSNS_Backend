module.exports = {
    // Success
    SUCCESS: {"isSuccess": true, "code": 1000, "message": "성공"},
    
    // -----------------
    // 1. Auth
    // -----------------
    // 토큰
    SIGNUP_TOKEN_EMPTY: {isSuccess: false, code: 1051, message: "회원가입 토큰이 없습니다"},
    SIGNUP_TOKEN_VERIFICATION_FAIL: {isSuccess: false, code: 1052, message: "회원가입 토큰 에러"},
    SIGNIN_TOKEN_EMPTY: {isSuccess: false, code: 1053, message: "로그인 토큰이 없습니다"},
    SIGNIN_TOKEN_VERIFICATION_FAIL: {isSuccess: false, code: 1054, message: "로그인 토큰 에러"},
    
    // 이메일 인증
    EMAIL_VERIFICATION_EMAIL_EMPTY: {isSuccess: false, code: 1101, message: "이메일을 입력해주세요"},
    EMAIL_VERIFICATION_EMAIL_TYPE_WRONG: {isSuccess: false, code: 1102, message: "이메일 형식에 맞게 입력해주세요"},
    EMAIL_VERIFICATION_EMAIL_DUPLICATED: {isSuccess: false, code: 1103, message: "이미 해당 이메일로 가입한 계정이 있습니다"},
    EMAIL_VERIFICATION_COUNT_EXCEED: {isSuccess: false, code: 1104, message: "하루 최대 인증 횟수를 초과했습니다"},
    EMAIL_VERIFICATION_CODE_EMPTY: {isSuccess: false, code: 1105, message: "이메일 인증코드를 입력해주세요"},
    EMAIL_VERIFICATION_NOT_GENERATED: {isSuccess: false, code: 1106, message: "이메일 인증을 시작하지 않았습니다"},
    EMAIL_VERIFICATION_CODE_NOT_MATCH: {isSuccess: false, code: 1107, message: "인증코드가 일치하지 않습니다"},
    EMAIL_VERIFICATION_TIMEOUT: {isSuccess: false, code: 1108, message: "인증시간을 초과했습니다"},
    
    // 닉네임 중복검사
    SIGNUP_NICKNAME_EMPTY: {isSuccess: false, code: 1111, message: "닉네임을 입력해주세요"},
    SIGNUP_NICKNAME_LENGTH_OVER: {isSuccess: false, code: 1112, message: "닉네임은 12자 이내로 입력해주세요"},
    SIGNUP_NICKNAME_REGEX_WRONG: {isSuccess: false, code: 1113, message: "닉네임은 특수문자 없이 입력해주세요"},
    SIGNUP_NICKNAME_DUPLICATED: {isSuccess: false, code: 1114, message: "중복된 닉네임입니다"},
    
    // 로컬계정 회원가입
    SIGNUP_EMAIL_NOT_MATCH: {isSuccess: false, code: 1121, message: "코드 인증한 이메일과 현재 이메일이 일치하지 않습니다"},
    SIGNUP_EMAIL_VERIFICATION_NOT_MATCH: {isSuccess: false, code: 1122, message: "메일 인증한 내역이 없습니다"},
    SIGNUP_PASSWORD_EMPTY: {isSuccess: false, code: 1123, message: "비밀번호를 입력해주세요"},
    SIGNUP_PASSWORD_LENGTH_OVER: {isSuccess: false, code: 1124, message: "비밀번호는 8자리 이상, 20자리 이하로 입력해주세요"},
    SIGNUP_PASSWORD_REGEX_WRONG: {isSuccess: false, code: 1125, message: "비밀번호는 최소 한 글자 이상의 영어, 숫자, 특수문자를 포함해서 입력해주세요"},
    
    // OAuth 인가코드
    OAUTH_AUTHORIZATION_PROVIDER_WRONG: {isSuccess: false, code: 1131, message: "SNS 플랫폼을 확인해주세요"},
    
    // 로그인
    SIGNIN_LOCAL_PASSPORT: {isSuccess: false, code: 1141, message: "로그인을 할 수 없습니다 / Passport Error"},
    SIGNIN_LOCAL_USER_NOT_FOUND: {isSuccess: false, code: 1142, message: "사용자 정보를 찾을 수 없습니다"},
    SIGNIN_LOCAL_USER_STATUS: {isSuccess: false, code: 1143, message: "사용 중지된 계정입니다"},
    SIGNIN_LOCAL_USER_PASSWORD_WRONG: {isSuccess: false, code: 1144, message: "비밀번호를 다시 확인해주세요"},
    
    SIGNIN_KAKAO_AUTHORIZATION_CODE_WRONG: {isSuccess: false, code: 1151, message: "카카오 인가코드를 다시 확인해주세요"},
    SIGNIN_KAKAO_ACCESS_TOKEN_WRONG: {isSuccess: false, code: 1152, message: "카카오 액세스 토큰을 다시 확인해주세요"},
    SIGNIN_KAKAO_USER_STATUS: {isSuccess: false, code: 1153, message: "사용 중지된 계정입니다"},
    SIGNIN_KAKAO_USER_NOT_CREATED: {isSuccess: false, code: 1154, message: "계정이 생성되지 않았습니다"},
    
    // OAuth 닉네임 등록
    OAUTH_ADDINFO_USER_NOT_FOUND: {isSuccess: false, code: 1201, message: "사용자 정보를 찾을 수 없습니다"},
    OAUTH_ADDINFO_NICKNAME_EMPTY: {isSuccess: false, code: 1202, message: "닉네임을 입력해주세요"},
    OAUTH_ADDINFO_NICKNAME_LENGTH_OVER: {isSuccess: false, code: 1203, message: "닉네임은 12자 이내로 입력해주세요"},
    OAUTH_ADDINFO_NICKNAME_REGEX_WRONG: {isSuccess: false, code: 1204, message: "닉네임은 특수문자 없이 입력해주세요"},
    OAUTH_ADDINFO_NICKNAME_DUPLICATED: {isSuccess: false, code: 1205, message: "중복된 닉네임입니다"},
    
    
    // 리프레시 토큰
    ACCESS_TOKEN_EMPTY: {isSuccess: false, code: 1101, message: "토큰이 없습니다"},
    ACCESS_TOKEN_VERIFICATION_FAIL: {isSuccess: false, code: 1102, message: "토큰 인증에 실패했습니다"},
    ACCESS_TOKEN_EXPIRED: {isSuccess: false, code: 1103, message: "토큰이 만료됐습니다"},

    REFRESH_TOKEN_EMPTY: {isSuccess: false, code: 1111, message: "리프레시 토큰이 없습니다"},
    REFRESH_TOKEN_EXPIRED: {isSuccess: false, code: 1112, message: "리프레시 토큰이 만료됐습니다"},
    REFRESH_TOKEN_VERIFICATION_FAIL: {isSuccess: false, code: 1113, message: "리프레시 토큰 복호화를 실패했습니다"},
    REFRESH_TOKEN_IP_NOT_MATCH: {isSuccess: false, code: 1114, message: "IP가 일치하지 않습니다. 로그인을 다시 해주세요"},
    REFRESH_TOKEN_SESSION_DELETED: {isSuccess: false, code: 1115, message: "세션 정보가 삭제됐습니다. 로그인을 다시 해주세요"},

    
    
    // -----------------
    // 2. User
    // -----------------

    // SignUp
    PASSWORD_VALIDATION_FAIL: {isSuccess: false, code: 1510, message: "password condition does not match"},
    NICKNAME_VALIDATION_FAIL: {isSuccess: false, code: 1511, message: "nickname condition does not match"},
    EV_VERIFICATION_FAIL: {isSuccess: false, code: 1520, message: "email verification process failed"},

    // User
    USER_VALIDATION_FAILURE: {isSuccess: false, code: 2000, message: "사용자 인증에 실패했습니다" },
    ACCOUNT_DETAILS_SAVED: {isSuccess: false, code: 2001, message: "account details already saved"},
    
    // Running
    RUNNING_START_LOCATION_EMPTY: {isSuccess: false, code: 2501, message: "Location info is empty"},
    RUNNING_START_LOCATION_TYPE_WRONG: {isSuccess: false, code: 2502, message: "Location type is wrong"},
    
    RUNNING_CHECK_RESTART_TYPE_WRONG: {isSuccess: false, code: 2511, message: "Check restart query"},
    RUNNING_CHECK_LOCATION_EMPTY: {isSuccess: false, code: 2512, message: "Location info is empty"},
    RUNNING_CHECK_LOCATION_TYPE_WRONG: {isSuccess: false, code: 2513, message: "Location type is wrong"},
    
    RUNNING_STOP_LOCATION_EMPTY: {isSuccess: false, code: 2521, message: "Location info is empty"},
    RUNNING_STOP_LOCATION_TYPE_WRONG: {isSuccess: false, code: 2522, message: "Location type is wrong"},
    
    RUNNING_END_FORCE_END_WRONG: {isSuccess: false, code: 2531, message: "Force end is wrong"},
    RUNNING_END_LOCATION_EMPTY: {isSuccess: false, code: 2532, message: "Location info is empty"},
    RUNNING_END_LOCATION_TYPE_WRONG: {isSuccess: false, code: 2533, message: "Location type is wrong"},
    
    
    // ----------------
    // 3. Reward
    // ----------------
    CHALLENGE_NOT_FOUND: {"isSuccess": false, code: 3001, message: "Challenge cannot found" },
    
    REWARD_USER_INFO_NOT_FOUND: {"isSuccess": false, code: 3011, message: "User info not found" },
    REWARD_USER_NICKNAME_NOT_FOUND: {"isSuccess": false, code: 3012, message: "User nickname not found" },
    REWARD_MENTION_NOT_FOUND: {"isSuccess": false, code: 3013, message: "Today mention not found" },
    REWARD_SHOPPING_LIST_NOT_FOUND: {"isSuccess": false, code: 3014, message: "Shopping list not found" },
    REWARD_CHALLENGE_INFO_NOT_FOUND: {"isSuccess": false, code: 3015, message: "Challenge info not found" },
    
    REWARD_EXERCISE_USER_GROUP_CHECK: {"isSuccess": false, code: 3021, message: "This user cannot do group exercise" },
    
    RUNNING_USER_NOT_FOUND: {"isSuccess": false, code: 3031, message: "User info not found" },
    RUNNING_USER_NICKNAME_NOT_FOUND: {"isSuccess": false, code: 3032, message: "User nickname not found" },
    RUNNING_USER_EXERCISE_LOCATION_EXIST: {"isSuccess": false, code: 3033, message: "Exercise location is already exist" },
    
    RUNNING_CHECK_USER_NOT_FOUND: {"isSuccess": false, code: 3041, message: "User info not found" },
    RUNNING_CHECK_USER_NICKNAME_NOT_FOUND: {"isSuccess": false, code: 3042, message: "User nickname not found" },
    RUNNING_CHECK_PRIOR_LOCATION_NOT_FOUND: {"isSuccess": false, code: 3043, message: "Prior location not found" },
    RUNNING_CHECK_TIME_LESS_ZERO: {"isSuccess": false, code: 3044, message: "Exercise time is less than zero" },
    RUNNING_CHECK_TIME_OUT: {"isSuccess": false, code: 3045, message: "Exercise time out (over 3 hours)" },
    RUNNING_CHECK_UPDATE_LOCATION_ERROR: {"isSuccess": false, code: 3046, message: "Update location error" },
    RUNNING_CHECK_UPDATE_EXERCISE_ERROR: {"isSuccess": false, code: 3047, message: "Update exercise error" },
    RUNNING_CHECK_EXERCISE_NOT_FOUND: {"isSuccess": false, code: 3048, message: "Exercise info not found" },
    
    RUNNING_STOP_USER_NOT_FOUND: {"isSuccess": false, code: 3051, message: "User info not found" },
    RUNNING_STOP_USER_NICKNAME_NOT_FOUND: {"isSuccess": false, code: 3052, message: "User nickname not found" },
    RUNNING_STOP_PRIOR_LOCATION_NOT_FOUND: {"isSuccess": false, code: 3053, message: "Prior location not found" },
    RUNNING_STOP_TIME_LESS_ZERO: {"isSuccess": false, code: 3054, message: "Exercise time is less than zero" },
    RUNNING_STOP_TIME_OUT: {"isSuccess": false, code: 3055, message: "Exercise time out (over 3 hours)" },
    RUNNING_STOP_UPDATE_LOCATION_ERROR: {"isSuccess": false, code: 3056, message: "Update location error" },
    RUNNING_STOP_UPDATE_EXERCISE_ERROR: {"isSuccess": false, code: 3057, message: "Update exercise error" },
    RUNNING_STOP_EXERCISE_NOT_FOUND: {"isSuccess": false, code: 3058, message: "Exercise info not found" },
    
    RUNNING_END_USER_NOT_FOUND: {"isSuccess": false, code: 3061, message: "User info not found" },
    RUNNING_END_USER_NICKNAME_NOT_FOUND: {"isSuccess": false, code: 3062, message: "User nickname not found" },
    RUNNING_END_PRIOR_LOCATION_NOT_FOUND: {"isSuccess": false, code: 3063, message: "Prior location not found" },
    RUNNING_END_TIME_LESS_ZERO: {"isSuccess": false, code: 3064, message: "Exercise time is less than zero" },
    RUNNING_END_TIME_OUT: {"isSuccess": false, code: 3065, message: "Exercise time out (over 3 hours)" },
    RUNNING_END_UPDATE_LOCATION_ERROR: {"isSuccess": false, code: 3066, message: "Update location error" },
    RUNNING_END_UPDATE_EXERCISE_ERROR: {"isSuccess": false, code: 3067, message: "Update exercise error" },
    RUNNING_END_EXERCISE_NOT_FOUND: {"isSuccess": false, code: 3068, message: "Exercise info not found" },
    
    
    
    //Connection, Transaction 등의 서버 오류
    DB_ERROR: {"isSuccess": false, "code": 9000, "message": "데이터 베이스 에러"},
    SERVER_ERROR: {"isSuccess": false, "code": 9001, "message": "서버 에러"},
}
