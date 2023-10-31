//jshint esversion:6
const express = require('express')
const mongoose = require('mongoose')
const env= require('dotenv').config()
const bodyParser = require('body-parser')
const ejs = require('ejs');
const app = express()
const encrypt = require('mongoose-encryption')


app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
const port =7500
mongoose.connect("mongodb://127.0.0.1:27017/aut",{useNewUrlParser:true,useUnifiedTopology: true})
const userschema = new mongoose.Schema({
    email:String,
    password:String
})
userschema.plugin(encrypt,{secret:process.env.SECRET, encryptedFields:['password']});


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
    const email = req.body.username;
    const password = req.body.password;
    console.log(email, password);
    
    const newUser = new User({email: email, password: password});
    
    User.findOne({email: email})
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

app.post("/login", (req, res) => {
    const email = req.body.username;
    const password = req.body.password;
    
    User.findOne({email: email})
        .then(foundUser => {
            if(foundUser){
                if(foundUser.password === password){
                    res.render("secrets");
                } else {
                    res.status(400).send("Username or password is incorrect");
                }
            } else {
                res.status(400).send("User not found");
            }
        })
        .catch(err => console.log(err));
});
