const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');

var userSchema = new Schema({
    "userName": {
        "type":String,
        "unique":true
    },
    "password":String,
    "email":String,
    "loginHistory":[{
        "dateTime":Date,
        "userAgent":String
    }]
});

let User; // to be defined on new connection (see below)

exports.initialize = () => {
    return new Promise((resolve,reject) => {
        let db = mongoose.createConnection("mongodb+srv://Trump007:Wang930811@senecaweb.6rnztgg.mongodb.net/?retryWrites=true&w=majority");
        db.on('error', (err) => {
            reject();
        })
        db.once('open', () => {
            User = db.model("Users",userSchema);
            resolve();
        })
    })
};

function isEmptyOrSpaces(str){
    return str === null || str.match(/^ *$/) !== null;
}

exports.registerUser = (userData) => {
    return new Promise((resolve, reject) => {
        if (isEmptyOrSpaces(userData.password)||isEmptyOrSpaces(userData.password)){
            reject("Error: user name cannot be empty or only white spaces!");
        }
        else if (userData.password != userData.password2) {
            reject("Error: Passwords do not match");
        }
        else {
            // to encrypt a plain text password, we can use bcrypt to generate a “salt” and “hash” the text
            bcrypt.genSalt(10, function(err, salt) {
                bcrypt.hash(userData.password, salt, function(err, hash) {
                    if (err) {
                        reject(err);
                    }
                    else {
                        userData.password = hash;
                        let newUser = new User(userData);
                        newUser.save((err) => {
                            if (err) {
                                if (err.code === 11000) {
                                    reject("User Name already taken");
                                }
                                else {
                                    reject("There was an error creating the user: " + err);
                                }
                            }
                            else {
                                resolve();
                            }
                        })
                    }
                })
            })
        }
    })
};

exports.checkUser = (userData) => {
    return new Promise((resolve, reject) => {
        User.find({userName: userData.userName})
        .exec()
        .then(users => {
            if(!users){
                reject('Unable to find user: ' + userData.userName);
            }
            else{
                bcrypt.compare(userData.password, users[0].password).then(res => {
                    if(!res){
                        reject("Incorrect Password for user: " + userData.userName); 
                    }
                    else {   
                        users[0].loginHistory.push({dateTime: (new Date()).toString(), userAgent:userData.userAgent});
                        User.update(
                            { userName: users[0].userName },
                            { $set: {loginHistory: users[0].loginHistory} },
                            { multi: false }
                        )
                        .exec()
                        .then(() => {resolve(users[0])})
                        .catch(err => {reject("There was an error verifying the user: " + err)})
                    }
                })
            }
        })
        .catch(() => { 
            reject("Unable to find user: " + userData.userName); 
        }) 
    })
};