const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: '',
    user: '',
    port: '',
    password: '',
    database: ''
});

module.exports = {
    pool: pool
};