var express = require('express');
var {ensureAuthenticated} = require("../config/auth.js")
var router = express.Router();

// Require controller modules.
var controller = require('../controllers/controller');

//login page
router.get('/', controller.renderWelcome);

/* GET home page. */
router.get('/browse', ensureAuthenticated, controller.renderIndex);

router.post('/addFilm', controller.addFilm);

router.post('/removeFilm', controller.removeFilm);

router.post('/watchFilm', controller.watchFilm);

router.post('/rateFilm', controller.rateFilm);

router.post('/moreInfo', controller.moreInfo);

router.get('/watchlist', ensureAuthenticated, controller.renderWatchlist);

router.get('/watched', ensureAuthenticated, controller.renderWatched);

router.get('/metrics', ensureAuthenticated, controller.renderMetrics);

router.post('/getMetrics', ensureAuthenticated, controller.getMetrics);

module.exports = router;
