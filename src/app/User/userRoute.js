var express = require('express');
var router = express.Router();
const userController = require('./userController.js');
const {authenticate} = require("../../middleware/auth");

router.get('/target');
router.post('/');

module.exports = router;
