//jshint esversion:6
const express = require('express')
const mongoose = require('mongoose')
const env= require('dotenv').config()
const bodyParser = require('body-parser')
const ejs = require('ejs');
const app = express()
const bcrypt = require('bcrypt')
const saltRounds=10

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
const port =9000
mongoose.connect("mongodb://127.0.0.1:27017/aut",{useNewUrlParser:true,useUnifiedTopology: true})
const userschema = new mongoose.Schema({
    email:String,
    password:String
})

console.log(process.env.SECRET)
const User=new mongoose.model('User',userschema)
app.listen(port,(err)=>{
    err?console.log(err):console.log(`port listening on ${port}`)
})
app.get("/",(req, res)=>{
    res.render("home")
})
app.get("/login",(req, res)=>{
    res.render("login")
});
app.get("/register",(req, res)=>{
  res.render("register")
})

app.post("/register", (req, res) => {
    bcrypt.hash( req.body.password, saltRounds, function(err, hash) {
        const newUser = new User({
            email: req.body.username,
            password: hash
        });
        User.findOne({email: req.body.username})
        .then(foundUser => {
            if(foundUser){
                res.status(400).send("email already registered");
            } else {
                newUser.save()
                    .then(() => res.render("secrets"))
                    .catch(err => console.log(err));
            }
        })
        .catch(err => console.log(err));
    });
});

app.post("/login", (req, res) => {
    const email = req.body.username;
    const password = req.body.password;
    
    User.findOne({email: email})
        .then(foundUser => {
            if(foundUser){
                bcrypt.compare(password, foundUser.password).then(function(result) {
                    if(result){
                        res.render("secrets");
                    } else {
                        res.status(400).send("Username or password is incorrect");
                    }
                });
            } else {
                res.status(400).send("User not found");
            }
        })
        .catch(err => console.log(err));
});
