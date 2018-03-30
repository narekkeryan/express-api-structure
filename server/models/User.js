var mongoose = global.mongoose;
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    salt: String,
    created_at: {
        type: Number,
        required: true,
        default: Math.round(new Date().getTime()/1000)
    },
    updated_at: {
        type: Number,
        required: true,
        default: Math.round(new Date().getTime()/1000)
    }
});

var User = module.exports = mongoose.model('User', UserSchema);