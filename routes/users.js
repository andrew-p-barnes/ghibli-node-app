var express = require('express');
var router = express.Router();

// Require controller modules.
var controller = require('../controllers/controller');

//login handle
router.get('/login', controller.renderLogin);

router.get('/register', controller.renderRegister);

//Register handle
router.post('/login', controller.loginUser);

router.post('/register', controller.registerUser);

//logout
router.get('/logout', controller.renderLogout);
 
module.exports  = router;
