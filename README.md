# 러닝하이 API Server

Node.js API Server

## Features

- 자바스크립트
- Node.js 런타임
- Express 프레임워크
- REST API

## Folder Structure

```
.
├── common                              # 사용자 정의 함수가 들어있는 폴더
│   ├── index.js                        # async 래핑 함수
├── config                              # 설정 파일들이 들어가 있는 폴더
│   ├── response.js                     # API 응답 프레임
│   ├── baseResponseStatus.js           # API 응답 코드 및 메세지
│   ├── winston.js                      # logger 설정
├── node_modules                        # 노드 모듈
├── src
│   ├── app                             # 어플리케이션에 대한 코드 작성
│   │   ├── Auth                        # 인증 관련 코드
│   │   │   ├── authRoute.js
│   │   │   ├── authController.js
│   │   │   ├── authProvider.js
│   │   │   ├── authService.js
│   │   ├── User                        # User 관련 코드
│   │   │   ├── userRoute.js
│   │   │   ├── userController.js
│   │   │   ├── userProvider.js
│   │   │   │
│   │   ├── Reward                      # Reward 관련 코드
│   │   │   ├── rewardRoute.js
│   │   │   ├── rewardController.js
│   │   │   ├── rewardProvider.js
│   │   │   ├── rewardService.js
├── utils
├── .gitignore                          # git 에 포함되지 않아야 하는 폴더, 파일들을 작성 해놓는 곳
├── index.js                            # express 미들웨어 포함
├── package-lock.json
├── package.json                        # 프로그램 이름, 버전, 필요한 모듈 등 노드 프로그램의 정보를 기술
└── README.md
```

<br>
<br>

---
## Prisma 사용법
### 1) schema.prisma를 수정하는 경우 (ex. 테이블 추가시)
1. `npx prisma migrate dev --name "여기에 migration 설명 추가"` 입력
2. `prisma/migrate` 폴더에 migration 생성됨
3. `npx prisma generate`
4. `@prisma/client`에 client 생성되어 import 해서 사용하면 됨

### 2) seeding
1. `prisma/seed.js`에 mock up 데이터 추가 쿼리 작성
2. `npm run seed` 실행
3. `prisma.schema`에 설정된 db에 row 삽입됨(만약 이미 존재하는 경우 unique 규칙에 위반되면 오류 발생)

### 3) DB 초기화 후 처음부터 migration 진행
1. `npx prisma migrate reset`
2. `npm run seed` 로 seeding

### 4) DB에서 스키마 변경 후 작업
```javascript
// db에서 스키마 불러오기
npx prisma db pull

// prisma client에 적용
npx prisma generate
```

### 5) express에서 prisma client 사용
```javascript
const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();
```

---

<br>
<br>

## RESPONSE CODE
`config/response.js`
```javascript
{
    const response = ({isSuccess, code, message}, result) => {
        return {
            isSuccess: isSuccess,
            code: code,
            message: message,
            result: result
        }
    };
    
    const errResponse = ({isSuccess, code, message}) => {
        return {
            isSuccess: isSuccess,
            code     : code,
            message  : message
        }
    };
}
```

<br>
<br>

---

## API Connection

본 서버는 러닝하이(생활운동 앱테크) 서비스에서 사용하는 API로써 역할을 함

### Option 1: Connection Test

서버 연결을 위한 API 테스트 가이드

https://www.sosocamp.shop/app/test/connection 으로 POST 요청
