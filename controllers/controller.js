var fetch = require('node-fetch');
var User = require("../models/user.js");
var Review = require("../models/review.js");
var Watch = require("../models/watch.js");
var bcrypt = require('bcrypt');
var passport = require('passport');
var FilmManager = require('../public/javascripts/filmManager');
var filmManager;

exports.renderWelcome = function(req, res) {
    res.render('welcome');
}

exports.renderLogin = function(req, res) {
    res.render('login');
}

exports.renderRegister = function(req, res) {
    res.render('register');
}

exports.loginUser = function(req, res) {
    passport.authenticate('local', {
        successRedirect : '/browse',
        failureRedirect : '/users/login',
        failureFlash : true
    })(req,res)
    filmManager = new FilmManager();
}

exports.registerUser = function(req, res) {
    const {name,email, password, password2} = req.body;
    let errors = [];
    console.log(' Name ' + name + ' email :' + email + ' pass:' + password);
    if(!name || !email || !password || !password2) {
        errors.push({msg : "Please fill in all fields"})
    }
    //check if match
    if(password !== password2) {
        errors.push({msg : "Passwords don't match"});
    }
    //check if password is more than 6 characters
    if(password.length < 6 ) {
        errors.push({msg : 'Password must be at least 6 characters'})
    }
    if(errors.length > 0 ) {
    res.render('register', {
        errors : errors,
        name : name,
        email : email,
        password : password,
        password2 : password2})
    } else {
           // validation passed, check if email in use
        User.findOne({email : email}).exec((err,user)=>{
            console.log(user);   
            if(user) {
                errors.push({msg: 'Email already registered'});
                res.render('register', {
                    errors : errors,
                    name : name,
                    email : email,
                    password : password,
                    password2 : password2})
            }
            else {
                // if email not in use, check if name in use
                User.findOne({name : name}).exec((err,user)=>{
                    console.log(user);   
                    if(user) {
                        errors.push({msg: 'Name already used'});
                        res.render('register', {
                            errors : errors,
                            name : name,
                            email : email,
                            password : password,
                            password2 : password2})
                    }
                    else {
                        const newUser = new User({
                            name : name,
                            email : email,
                            password : password
                        });
                        bcrypt.genSalt(10,(err,salt)=> 
                        bcrypt.hash(newUser.password,salt,
                            (err,hash)=> {
                                if(err) throw err;
                                    //save pass to hash
                                    newUser.password = hash;
                                //save user
                                newUser.save()
                                .then((value)=>{
                                    console.log(value)
                                    req.flash('success_msg','You have now registered!')
                                    res.redirect('/users/login');
                                })
                                .catch(value=> console.log(value));
                        }));
                    }
                });
            }
        });
    }
};
        
exports.renderLogout = function(req, res) {

    let statusJSONStr = filmManager.getFilmStatusJSONstr()
    console.log('statusJSONStr  =' + statusJSONStr);

    const updateStatusPromise = new Promise(function(resolve, reject) {
        resolve(User.updateFilmStatus(req.user.email, statusJSONStr));
    });
    updateStatusPromise
        .then(function() {
            filmManager = null;
        })
        .catch(function(err) {
            console.log(err);
        });
    
    req.logout();
    req.flash('success_msg','Now logged out');
    res.redirect('/users/login');
};

exports.renderIndex = function(req, res) {

// saving status different users only works if server is stopped b/w different user logins. otherwise film.length > 0, below does not run and second user gets the list
// of first user, then on log out, both lists are same in db

    if (filmManager.films.length == 0) {

        // var used for Map objects as function scope required because createFilms inner function refers to these variables
        var statusMap = new Map();
        var userReviewMap = new Map();
        var avgUserReviewMap = new Map();

        const findUserPromise = new Promise(function(resolve, reject) {
            resolve(User.findByEmail(req.user.email));
        });

        // find any reviews created by the user
        const findUserReviewsPromise = new Promise(function(resolve, reject) {
            resolve(Review.findReviewsByName(req.user.name));
        });

        const findAvgReviewsPromise = new Promise(function(resolve, reject) {
            resolve(Review.findAvgUserRating());
        });

        findUserPromise
        .then(function(userDoc) {
            if (userDoc.filmStatus) {
                let statusJSONStr = userDoc.filmStatus;
                console.log(statusJSONStr);
                let statusArray = JSON.parse(statusJSONStr);
                statusArray.forEach(film => {
                    statusMap.set(film[0], film[1]); // set the film title as the key, and film status as the value
                })
            }
            return findUserReviewsPromise;
        })
        .then(function(reviews) {
            console.log(reviews);
            reviews.forEach(film => {
                userReviewMap.set(film.filmTitle, film.filmRating); // set the film title as the key, and film user rating as the value
            })
            return findAvgReviewsPromise;
        })
        .then(function(reviews) {
            console.log(reviews);
            reviews.forEach(film => {
                avgUserReviewMap.set(film.filmTitle, Math.round(film.avgRating)); // set the film title as the key, and film avg user rating as the value
            })
            createFilms();
        })
        .catch(function(error) {
            console.log(error);
            res.status(500).send({error: error})
        });
    }
    else {
        let filmsList = filmManager.getFilms();
            res.render('index', {filmsList: filmsList, user: req.user});
    }

    function createFilms() {
        fetch('https://ghibliapi.herokuapp.com/films')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json()
        })
        .then(function(data) {
            data.forEach(item => {
                let filmObj = {
                    title: item.title,
                    description: item.description,
                    release_date: item.release_date,
                    rt_score: item.rt_score,
                    userScore: null,
                    avgUserScore: null,
                    status: "avail"
                };
                if (statusMap.size) {
                    if (statusMap.has(item.title)) {
                        let savedStatus = statusMap.get(item.title);
                        filmObj.status = savedStatus;
                    }
                };
                if (userReviewMap.size) {
                    let savedRating = userReviewMap.get(item.title);
                    filmObj.userScore = savedRating;
                };
                if (avgUserReviewMap.size) {
                    let avgRating = avgUserReviewMap.get(item.title);
                    filmObj.avgUserScore = avgRating;
                };
                let film = filmManager.createFilm(filmObj.title, filmObj.description, filmObj.release_date, filmObj.rt_score, filmObj.userScore, 
                        filmObj.avgUserScore, filmObj.status);
                filmManager.addFilm(film);
            });
            let filmsList = filmManager.getFilms();
            res.render('index', {filmsList: filmsList, user: req.user});
        })
        .catch(error => {
            res.status(500).send({error: error})
        });
    }
};

exports.addFilm = function(req, res) {
    var filmId = req.body.filmId;
    console.log(filmId);
    filmManager.setFilmStatus(filmId, "watchlist");
    res.send({ message: 'Film added to watchlist' }); 
};

exports.removeFilm = function(req, res) {
    var filmId = req.body.filmId;
    console.log(filmId);
    filmManager.setFilmStatus(filmId, "avail");
    res.send({ message: 'Film removed from watchlist' }); 
};

exports.watchFilm = function(req, res) {
    var filmId = req.body.filmId;
    console.log(filmId);
    filmManager.setFilmStatus(filmId, "watched");
    let film = filmManager.getFilmById(filmId);
    let filmTitle = film.title;

    const createWatchPromise = new Promise(function(resolve, reject) {
        resolve(Watch.createWatch(req.user.name, filmTitle));
    });
    createWatchPromise
        .then(function(watch) {
            console.log(watch);
            res.send({ message: 'Film watched' }); 
        })
        .catch(function(err) {
            console.log(err);
        });
};

exports.rateFilm = function(req, res) {
    let filmId = req.body.filmId;
    let userScore = req.body.ratingVal;
    filmManager.setFilmUserScore(filmId, userScore);
    let film = filmManager.getFilmById(filmId);
    let filmTitle = film.title;
    let filmComment = req.body.filmComment;

    const createReviewPromise = new Promise(function(resolve, reject) {
        resolve(Review.createReview(req.user.name, filmTitle, userScore, filmComment));
    });
    createReviewPromise
        .then(function(review) {
            console.log(review);
            res.send({ message: "Film rated" }); 
        })
        .catch(function(err) {
            console.log(err);
        });
};

exports.moreInfo = function(req, res) {
    let filmId = req.body.filmId;
    let film = filmManager.getFilmById(filmId);
    let filmTitle = film.title;
    let filmDescription = film.description

    const findReviewsPromise = new Promise(function(resolve, reject) {
        resolve(Review.findLast3ReviewsByTitle(film.title));
    });
    findReviewsPromise
        .then(function(reviews) {
            console.log(reviews);
            let response =
            {   
                filmTitle: filmTitle,
                filmDescription: filmDescription,
                filmReviews: reviews
            };
            res.json(response);
        })
        .catch(function(err) {
            console.log(err);
        });
};

exports.renderWatchlist = function(req, res) {
    let watchlist = filmManager.getFilmsByStatus("watchlist");
    res.render('watchlist', {watchlist: watchlist});
};

exports.renderWatched = function(req, res) {
    let watched = filmManager.getFilmsByStatus("watched");
    res.render('watched', {watched: watched});
};

exports.renderMetrics = function(req, res) {
    res.render('metrics');
};

exports.getMetrics = function(req, res) {
    let films = filmManager.getFilms();
    let numTotalFilms = films.length;
    
    const findWatchCountPromise = new Promise(function(resolve, reject) {
        resolve(Watch.findWatchCountByName(req.user.name));
    });
    const findFilmsWatchedPromise = new Promise(function(resolve, reject) {
        resolve(Watch.findTop5FilmsWatched());
    });
    const findCommentsPromise = new Promise(function(resolve, reject) {
        resolve(Review.findLast5Comments());
    });

    Promise.all([findWatchCountPromise, findFilmsWatchedPromise,findCommentsPromise])
    .then(values => {
        console.log(values);
            let response =
            {   
                numFilmsWatched: values[0],
                numTotalFilms: numTotalFilms,
                mostWatched: values[1],
                latestComments: values[2]
            };
            res.json(response);
    })
    .catch(error => {
        console.error(error.message)
    });
};