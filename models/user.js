var mongoose = require('mongoose');

const UserSchema  = new mongoose.Schema({
    name :{
        type  : String,
        required : true
    } ,
    email :{
        type  : String,
        required : true
    } ,
    password :{
        type  : String,
        required : true
    } ,
    date :{
        type : Date,
        default : Date.now
    },
    filmStatus :{
        type  : String,
        required : false
    }
});

UserSchema.statics.findByEmail = function(email) {
    return this.findOne({ email: email })
    .exec()
};

UserSchema.statics.findByName = function(name) {
    return this.findOne({ name: name })
    .exec()
};

UserSchema.statics.updateFilmStatus = function(email, statusStr) {
    return this.updateOne({ email: email }, {filmStatus: statusStr})
    .exec()
};

const User = mongoose.model('User',UserSchema);

module.exports = User;