const bcrypt = require("bcryptjs");
const User = require("../server/models/User");
const LocalStrategy = require("passport-local").Strategy;

exports.initialize = function initialize(passport) {
  passport.use(
    new LocalStrategy({ usernameField: "email" }, async function (
      email,
      password,
      done
    ) {
      try {
        const user = await User.findOne({ email: email.trim() });

        if (!user) {
          return done(null, false, { message: "Wrong Credentials" });
        } else {
          // check if user has a password or registered with google
          if (!user.password) {
            return done(null, false, { message: "Login With Google Instead" });
          }

          // check password correctness
          const correctPassword = await bcrypt.compare(password, user.password);

          if (!correctPassword) {
            return done(null, false, { message: "Incorrect Password" });
          } else {
            return done(null, user);
          }
        }
      } catch (err) {
        return done(err); // pass error to Passport
      }
    })
  );

  passport.serializeUser(function (user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(async function (id, done) {
    try {
      const user = await User.findById(id);
      done(null, user); // pass null for error and user for the serialized user
    } catch (err) {
      return done(err); // pass error to Passport
    }
  });
};
