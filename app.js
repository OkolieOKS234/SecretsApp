require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const { initialize, authenticate } = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const findOrCreate = require("mongoose-findorcreate");

const app = express();
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

app.use(
  session({
    secret: "My favourite secret",
    resave: false,
    saveUninitialized: false,
  })
);

// To initialize passport.js
app.use(passport.initialize());
// using sessions in passport
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB");

const userSchema = new mongoose.Schema({
  firstname: String,
  lastname: String,
  email: String,
  password: String,
});
// creating  a secret

// userSchema.plugin(encrypt, {
//   secret: process.env.SECRET,
//   encryptedFields: ["password"],
// });

// using passportLocalMongoose and mongoosefindOrcreate
userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = new mongoose.model("User", userSchema);
User.deleteMany({ firstname: "David" });

passport.use(User.createStrategy());
// This is from passport-local-mongoose
passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser((user, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

// OAuth
// options for using Oauth in my app
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/google/secrets",
      userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
    },
    // google will send accesstoken and profile data
    // findOrCreate is not a mongoose function but a passportjs function
    (accessToken, refreshToken, profile, cb) => {
      User.findOrCreate({ googleId: profile.id }, (err, user) => {
        return cb(err, user);
        console.log(profile);
      });
    }
  )
);

app.get("/", (req, res) => {
  res.render("home");
});

// Authentication route with google
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

app.get(
  "/auth/google/secrets",
  passport.authenticate("google", {
    successRedirect: "/auth/google/secrets",
    failureRedirect: "/login",
  }),
  (req, res) => {
    res.render("/secrets");
  }
);

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/register", (req, res) => {
  res.render("register");
});

// secrets route to check if the user is authenticated
app.get("/secrets", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("secrets");
  } else {
    res.redirect("/login");
  }
});

// Make the user to logout
app.get("/logout", (req, res) => {
  req.logOut();
  res.redirect("/");
});

// For registration of the user
app.post("/register", (req, res) => {
  User.register(
    { username: req.body.username },
    req.body.password,
    (err, user) => {
      if (err) {
        res.redirect("/register");
      } else {
        // send the cookie and tell the browser to hold on the cookies
        passport.authenticate("local")(req, res, () => {
          res.redirect("/secrets");
        });
      }
    }
  );
});
// This will be used from passport.js docs
app.post("/login", (req, res) => {
  const user = new User({
    username: req.body.username,
    password: req.body.password,
  });
  req.login(user, (err) => {
    if (err) {
      res.redirect("/login");
    } else {
      // authenticate the user
      passport.authenticate("local")(req, res, () => {
        res.redirect("/secrets");
      });
    }
  });
});

app.listen(3000, () => {
  console.log("Server has started");
});
