const {pool} = require("../../../config/database");
const userDao = require("./userDao");

//Provider : Read의 비즈니스 로직 처리
// 닉네임 중복 확인
exports.retrieveNickname = async function (nickname) {
    const connection = await pool.getConnection(async (conn) => conn);
    const retrieveNicknameResult = await userDao.selectNickname(connection, nickname);
    connection.release();
    
    return retrieveNicknameResult;
};


exports.retrieveUsers = async function (email) {
    if (!email) {
        const connection = await pool.getConnection(async (conn) => conn);
        const retrieveUsersResult = await userDao.selectUsers(connection);
        connection.release();

        return retrieveUsersResult;
    } else {
        const connection = await pool.getConnection(async (conn) => conn);
        const retrieveUsersResult = await userDao.selectUserByEmail(connection, email);
        connection.release();

        return retrieveUsersResult;
    }
};

exports.retrieveUserById = async function (id) {
    const connection = await pool.getConnection(async (conn) => conn);
    const userResult = await userDao.selectUserById(connection, id);
    connection.release();

    return userResult[0];
};

exports.checkUserEmail = async function (email) {
    const connection = await pool.getConnection(async (conn) => conn);
    const checkUserEmailResult = await userDao.selectUserByEmail(connection, email);
    connection.release();

    return checkUserEmailResult;
};

exports.checkUserNickname = async function (nickname) {
    const connection = await pool.getConnection(async (conn) => conn);
    const checkUserNicknameResult = await userDao.selectUserByNickname(connection, nickname);
    connection.release();

    return checkUserNicknameResult;
};

exports.checkUserPassword = async function (selectUserPasswordParams) {
    const connection = await pool.getConnection(async (conn) => conn);
    const checkUserPasswordResult = await userDao.selectUserPassword(connection, selectUserPasswordParams);
    connection.release();

    return checkUserPasswordResult[0];
};

exports.checkUserAccount = async function (email) {
    const connection = await pool.getConnection(async (conn) => conn);
    const checkUserAccountResult = await userDao.selectUserStatus(connection, email);
    connection.release();

    return checkUserAccountResult;
};

// TODO: hashedPassword, salt 가져오는 로직
exports.retrieveUserHashedPasswordAndSalt = async function (id) {
    const connection = await pool.getConnection(async (conn) => conn);
    const userSecurityResult = await userDao.selectUserHashedPasswordAndSalt(connection, id);

    connection.release();

    return userSecurityResult[0];
};