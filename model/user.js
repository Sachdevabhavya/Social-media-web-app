const mongoose = require("mongoose");

const Schema = mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true
    }
    // properties:{
    //     timestamps:{
    //         type: String,
    //         format: "date-time"
    //     }
    // }
});

const loginSchema = new mongoose.Schema({
    email: {
        type:String,
        required: true
    },
    password: {
        type: String,
        password: true
    }
});

const User = mongoose.model("users",Schema);
const Login = mongoose.model("login",loginSchema);

module.exports = User;