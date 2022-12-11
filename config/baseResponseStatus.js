module.exports = {
    // Success
    SUCCESS: {"isSuccess": true, "code": 1000, "message": "성공"},
    
    // -----------------
    // 1. Auth
    // -----------------
    // 액세스 토큰
    SIGNUP_TOKEN_EMPTY: {isSuccess: false, code: 1051, message: "회원가입 토큰이 없습니다"},
    SIGNUP_TOKEN_VERIFICATION_FAIL: {isSuccess: false, code: 1052, message: "회원가입 토큰 에러"},
    SIGNIN_TOKEN_EMPTY: {isSuccess: false, code: 1053, message: "로그인 토큰이 없습니다"},
    SIGNIN_TOKEN_VERIFICATION_FAIL: {isSuccess: false, code: 1054, message: "로그인 토큰 에러"},
    SIGNIN_TOKEN_ALREADY_LOGOUT: {isSuccess: false, code: 1055, message: "로그아웃 상태"},
    
    // 리프레시 토큰
    REFRESH_TOKEN_EMPTY: {isSuccess: false, code: 1061, message: "리프레시 토큰이 없습니다"},
    REFRESH_TOKEN_EXPIRED: {isSuccess: false, code: 1062, message: "리프레시 토큰이 만료됐습니다"},
    REFRESH_TOKEN_VERIFICATION_FAIL: {isSuccess: false, code: 1063, message: "리프레시 토큰 복호화를 실패했습니다"},
    REFRESH_TOKEN_GENERATE_FAIL: {isSuccess: false, code: 1064, message: "리프레시 토큰 생성 에러"},
    REFRESH_TOKEN_IP_NOT_MATCH: {isSuccess: false, code: 1065, message: "IP가 일치하지 않습니다. 로그인을 다시 해주세요"},
    REFRESH_TOKEN_SESSION_DELETED: {isSuccess: false, code: 1066, message: "세션 정보가 삭제됐습니다. 로그인을 다시 해주세요"},
    
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
    SIGNUP_EMAIL_VERIFICATION_EMPTY: {isSuccess: false, code: 1122, message: "메일 인증한 내역이 없습니다"},
    SIGNUP_PASSWORD_EMPTY: {isSuccess: false, code: 1123, message: "비밀번호를 입력해주세요"},
    SIGNUP_PASSWORD_LENGTH_OVER: {isSuccess: false, code: 1124, message: "비밀번호는 8자리 이상, 20자리 이하로 입력해주세요"},
    SIGNUP_PASSWORD_REGEX_WRONG: {isSuccess: false, code: 1125, message: "비밀번호는 최소 한 글자 이상의 영어, 숫자, 특수문자를 포함해서 입력해주세요"},
    
    // OAuth 인가코드
    OAUTH_AUTHORIZATION_PROVIDER_WRONG: {isSuccess: false, code: 1131, message: "SNS 플랫폼을 확인해주세요"},
    
    // 로그인
    SIGNIN_LOCAL_USER_NOT_FOUND: {isSuccess: false, code: 1141, message: "사용자 정보를 찾을 수 없습니다"},
    SIGNIN_LOCAL_USER_STATUS: {isSuccess: false, code: 1142, message: "사용 중지된 계정입니다"},
    SIGNIN_LOCAL_USER_PASSWORD_WRONG: {isSuccess: false, code: 1143, message: "비밀번호를 다시 확인해주세요"},
    
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


    
    
    // -----------------
    // 2. User (1250번대)
    // -----------------

    
    
    // -----------------
    // 3. Reward
    // -----------------
    // Running
    REWARD_USER_NOT_FOUND: {isSuccess: false, code: 1301, message: "사용자 정보를 찾을 수 없습니다"},
    REWARD_USER_STATUS_WRONG: {isSuccess: false, code: 1302, message: "사용 중지된 계정입니다" },
    RUNNING_CHOOSE_EXERCISE_TYPE_WRONG: {isSuccess: false, code: 1303, message: "운동 종류를 다시 확인해주세요"},
    REWARD_EXERCISE_USER_GROUP_CHECK: {isSuccess: false, code: 1304, message: "그룹 운동을 선택할 수 없습니다" },
    
    RUNNING_START_LOCATION_EMPTY: {isSuccess: false, code: 1311, message: "위치 정보가 없습니다"},
    RUNNING_START_LOCATION_TYPE_WRONG: {isSuccess: false, code: 1312, message: "위치 정보를 다시 확인해주세요"},
    
    RUNNING_CHECK_RESTART_TYPE_WRONG: {isSuccess: false, code: 1321, message: "운동 재시작 여부를 확인해주세요"},
    RUNNING_CHECK_LOCATION_EMPTY: {isSuccess: false, code: 1322, message: "위치 정보가 없습니다"},
    RUNNING_CHECK_LOCATION_TYPE_WRONG: {isSuccess: false, code: 1323, message: "위치 정보를 다시 확인해주세요"},
    
    RUNNING_STOP_LOCATION_EMPTY: {isSuccess: false, code: 1331, message: "위치 정보가 없습니다"},
    RUNNING_STOP_LOCATION_TYPE_WRONG: {isSuccess: false, code: 1332, message: "위치 정보를 다시 확인해주세요"},
    
    RUNNING_END_FORCE_END_WRONG: {isSuccess: false, code: 1341, message: "강제 종료 여부를 다시 확인해주세요"},
    RUNNING_END_LOCATION_EMPTY: {isSuccess: false, code: 1342, message: "위치 정보가 없습니다"},
    RUNNING_END_LOCATION_TYPE_WRONG: {isSuccess: false, code: 1343, message: "위치 정보를 다시 확인해주세요"},
    
    RUNNING_PROOF_IMAGE_EMPTY: {isSuccess: false, code: 1351, message: "인증 사진을 업로드 해주세요"},
    RUNNING_PROOF_EXERCISE_ID_EMPTY: {isSuccess: false, code: 1352, message: "사용자 운동 기록 ID를 확인해주세요"},
    
    
    
    // ----------------
    // Response
    // ----------------
    
    // ----------------
    // 3. Reward
    // ----------------
    // Reward
    REWARD_MENTION_NOT_FOUND: {"isSuccess": false, code: 3011, message: "오늘의 멘트를 찾을 수 없습니다" },
    REWARD_SHOPPING_LIST_NOT_FOUND: {"isSuccess": false, code: 3012, message: "쇼핑 목록을 찾을 수 없습니다" },
    REWARD_CHALLENGE_INFO_NOT_FOUND: {"isSuccess": false, code: 3013, message: "챌린지 목록을 찾을 수 없습니다" },
    
    RUNNING_USER_EXERCISE_LOCATION_EXIST: {"isSuccess": false, code: 3031, message: "이미 시작한 운동이 있습니다" },
    RUNNING_USER_EXERCISE_EXIST: {"isSuccess": false, code: 3032, message: "이미 시작한 운동 기록이 있습니다" },
    RUNNING_USER_EXERCISE_NOT_FOUND: {"isSuccess": false, code: 3033, message: "운동 기록을 찾을 수 없습니다" },
    
    RUNNING_CHECK_PRIOR_LOCATION_NOT_FOUND: {"isSuccess": false, code: 3041, message: "운동을 시작하지 않았습니다" },
    RUNNING_CHECK_TIME_LESS_ZERO: {"isSuccess": false, code: 3042, message: "운동 시간 간격이 없습니다" },
    RUNNING_CHECK_TIME_OUT: {"isSuccess": false, code: 3043, message: "운동 시간 초과 (3시간 이상)" },
    RUNNING_CHECK_EXERCISE_NOT_FOUND: {"isSuccess": false, code: 3044, message: "운동 기록을 찾을 수 없습니다" },
    
    RUNNING_STOP_PRIOR_LOCATION_NOT_FOUND: {"isSuccess": false, code: 3051, message: "운동을 시작하지 않았습니다" },
    RUNNING_STOP_TIME_LESS_ZERO: {"isSuccess": false, code: 3052, message: "운동 시간 간격이 없습니다" },
    RUNNING_STOP_TIME_OUT: {"isSuccess": false, code: 3053, message: "운동 시간 초과 (3시간 이상)" },
    RUNNING_STOP_EXERCISE_NOT_FOUND: {"isSuccess": false, code: 3054, message: "운동 기록을 찾을 수 없습니다" },
    
    RUNNING_END_PRIOR_LOCATION_NOT_FOUND: {"isSuccess": false, code: 3061, message: "운동을 시작하지 않았습니다" },
    RUNNING_END_TIME_LESS_ZERO: {"isSuccess": false, code: 3062, message: "운동 시간 간격이 없습니다" },
    RUNNING_END_EXERCISE_NOT_FOUND: {"isSuccess": false, code: 3063, message: "운동 기록을 찾을 수 없습니다" },
    
    RUNNING_PROOF_EXERCISE_NOT_FOUND: {"isSuccess": false, code: 3071, message: "운동 기록을 찾을 수 없습니다" },
    RUNNING_PROOF_EXERCISE_NOT_END: {"isSuccess": false, code: 3072, message: "운동이 종료되지 않았습니다" },
    
    CHALLENGE_NOT_FOUND: {"isSuccess": false, code: 3001, message: "챌린지를 찾을 수 없습니다" },
    
    
    //Connection, Transaction 등의 서버 오류
    DB_ERROR: {"isSuccess": false, "code": 9000, "message": "데이터 베이스 에러"},
    MAIL_TRANSPORTER_ERROR: {"isSuccess": false, "code": 9001, "message": "회원가입 인증메일 에러"},
    KAKAO_API_ERROR: {"isSuccess": false, "code": 9002, "message": "카카오 API 에러"},
}
