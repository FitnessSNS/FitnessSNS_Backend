const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');

const s3 = new aws.S3({
    region: process.env.AWS_S3_REGION,
    accessKeyId: process.env.AWS_S3_ACCESS_KEY,
    secretAccessKey: process.env.AWS_S3_SECRET_KEY
});

const allowedExtensions = ['.png', '.jpg', '.jpeg', '.bmp', '.gif'];

const uploadExerciseImage = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.AWS_S3_BUCKET,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        key: (req, file, callback) => {
            const userId = req.verifiedToken.id;
            
            // 오늘 날짜 구하기
            const today = new Date();
            const currentYear = today.getFullYear();
            const currentMonth = today.getMonth() + 1;
            const currentDate = today.getDate();
            const date = `${currentYear}-${currentMonth}-${currentDate}`;
            
            // 임의번호 생성
            let randomNumber = '';
            for (let i = 0; i < 8; i++) {
                randomNumber += String(Math.floor(Math.random() * 10));
            }
            
            // 확장자 검사
            const extension = path.extname(file.originalname).toLowerCase();
            if (!allowedExtensions.includes(extension)) {
                return callback(new Error('확장자 에러'));
            }
            
            callback(null, `exercise/${userId}_${date}_${randomNumber}`);
        },
        acl: 'public-read-write'
    }),
    // 이미지 용량 제한 (5MB)
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});

const deleteExerciseImage = async function delete_file(fileName)  {
    let params = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: `exercise/${fileName}`
    };
    
    try {
        await s3.deleteObject(params, async function (error, data) {
            if (error) {
                console.log('Delete S3 Object error: ', error.stack);
            } else {
                console.log(fileName, " 정상 삭제되었습니다");
            }
        });
    } catch(error) {
        customLogger.error(`deleteExerciseImage - AWS S3 error\n${error.message}`);
    }
};

module.exports = {
    uploadExerciseImage,
    deleteExerciseImage
};