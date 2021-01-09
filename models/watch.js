var mongoose = require('mongoose');

const WatchSchema  = new mongoose.Schema({
    name :{
        type  : String,
        required : true
    } ,
    filmTitle :{
        type  : String,
        required : true
    },
    date :{
        type : Date,
        default : Date.now
    },
});

//store film watch by user name and title

WatchSchema.statics.createWatch = function(name, title) {
    let watch = new Watch({ name: name, filmTitle: title})
    watch.save()
};

//find films watched by user name

WatchSchema.statics.findFilmsWatchedByName = function(name) {
    return this.find({ name: name })
    .exec()
};

//count films watched by user name

WatchSchema.statics.findWatchCountByName = function(name) {
    return this.find({ name: name }).countDocuments()
    .exec()
};

//find top 5 films watched

WatchSchema.statics.findTop5FilmsWatched = function() {
    return this.aggregate([
        { $group: { _id: "$filmTitle", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5},
        {$project: { filmTitle:"$_id",_id:0, count:1 }}
        ])
        .exec()
};

const Watch = mongoose.model('Watch', WatchSchema);

module.exports = Watch;