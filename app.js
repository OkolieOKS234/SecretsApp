const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");

const app = express();
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

mongoose.connect("mongodb://localhost:27017/userDB");

const userSchema = {
  firstname: String,
  lastname: String,
  email: String,
  password: String,
};
const User = new mongoose.model("User", userSchema);

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", (req, res) => {
  const newUser = new User({
    firstname: req.body.fname,
    lastname: req.body.lname,
    email: req.body.username,
    password: req.body.password,
  });
  newUser.save((err) => {
    if (!err) {
      res.render("secrets");
    } else {
      console.log(err);
    }
  });
});

app.post("/login", (req, res){
  const username = req.body.username;
  const password = req.body.password;

  User.findOne({email:username}, (err, foundUser)=>{
if(err){
  console.log(err);
}else{
  if(foundUser){
    if(foundUser.password === password){
      res.render("secrets")
    }
  }
}

  })

});

app.listen(3000, () => {
  console.log("Server has started");
});
