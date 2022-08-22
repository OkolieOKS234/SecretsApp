const bcrypt = require("bcrypt");
const saltRounds = 15;

app.post: register

bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
// Store hash in your password DB.

    const newUser = new User({
      firstname: req.body.fname,
      lastname: req.body.lname,
      email: req.body.username,
      password: hash,
    });
    newUser.save((err) => {
      if (!err) {
        res.render("secrets");
      } else {
        console.log(err);
      }
    });

});

app.post: login

const username = req.body.username;
const password = req.body.password;

User.findOne({ email: username }, (err, foundUser) => {
if (err) {
console.log(err);
} else {
if (foundUser) {
bcrypt.compare(password, foundUser.password, function (err, result) {
if (result == true) {
res.render("secrets");
}
});
}
}
});
