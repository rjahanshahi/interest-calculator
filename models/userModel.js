const mongoose = require('mongoose');
//later rework schema to fit google and regular login individually
//right now password is just made optional to allow both
const userSchema = mongoose.Schema({ 
    username: {type: String, required:true},
    password: {type: String, required: false},
    refreshToken: {type: String, required: false},
    data: {type: Number, required: false},
    'google.id': {type: String, required: false}
})

const User = mongoose.model('User', userSchema)

module.exports = User