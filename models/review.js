var mongoose = require('mongoose');

const ReviewSchema  = new mongoose.Schema({
    name :{
        type  : String,
        required : true
    } ,
    filmTitle :{
        type  : String,
        required : true
    },
    filmRating :{
        type  : Number,
        required : true
    },
    filmComment :{
        type  : String,
        required : true
    },
    date :{
        type : Date,
        default : Date.now
    },
});

//store film review by user name

ReviewSchema.statics.createReview = function(name, title, rating, comment) {
    let review = new Review({ name: name, filmTitle: title, filmRating: rating, filmComment: comment})
    review.save()
};

//find user film reviews by user name

ReviewSchema.statics.findReviewsByName = function(name) {
    return this.find({ name: name })
    .exec()
};

//find 5 most recent film comments

ReviewSchema.statics.findLast5Comments = function() {
    return this.aggregate([
        { $sort: { date: -1 } },
        { $limit: 5},
        { $project: { _id:0, filmTitle:1, name:1, filmComment:1, date:1 }}
        ])
    .exec()
};

//find 3 most recent film reviews by film title

ReviewSchema.statics.findLast3ReviewsByTitle = function(title) {
    return this.aggregate([
        { $match: { filmTitle: title } },
        { $sort: { date: -1 } },
        { $limit: 3},
        { $project: { _id:0, filmTitle:1, filmRating:1, name:1, filmComment:1, date:1 }}
        ])
    .exec()
};

//find avg user film review

ReviewSchema.statics.findAvgUserRating = function() {
    return this.aggregate([
        { $group: { _id: "$filmTitle", avgRating: { $avg: "$filmRating" }}},
        { $project: { filmTitle:"$_id",_id:0, avgRating:1 }}
        ])
    .exec()
};

const Review = mongoose.model('Review',ReviewSchema);

module.exports = Review;