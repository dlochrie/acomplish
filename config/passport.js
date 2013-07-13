exports.init = function (compound) {
  app = compound.app;

  var passport = require('passport'),
    GoogleStrategy = require('passport-google').Strategy,
    LocalStrategy = require('passport-local').Strategy,
    conf = compound.acomplish.passport;

  passport.use(new GoogleStrategy({
    returnURL: conf.host + conf.path + 'auth/google/return',
    realm: conf.host + conf.path,
    profile: true
  }, function login(identifier, profile, done) {
    compound.models.User.findOrCreateGoogle({
      openId: identifier,
      profile: profile
    }, function(err, user) {
      done(err, user);
    });
  }));

  passport.use(new LocalStrategy({usernameField: 'email'}, 
    function login(email, password, done) {
      compound.models.User.findLocal({
        email: email, 
        password: password
      }, 
      function (err, user) {
        if (err) { return done(err); }
        if (!user) {
          return done(null, false, { 
            message: 'The username / password combination not valid.'
          });
        }
        done(null, user);
      });
    }
  ));

  // convert user to userId
  passport.serializeUser(function serializeUser(user, done) {
    done(null, user.id);
  });

  // convert userId to user
  passport.deserializeUser(function deserializeUser(userId, done) {
    compound.models.User.find(userId, function (err, user) {
      done(err, user);
    });
  });

  app.get('/auth/google', passport.authenticate('google'));

  app.get('/auth/google/return',
    passport.authenticate('google', {
    successRedirect: '/',
    failureRedirect: '/login'
  }));

  app.post('/auth/local', 
    passport.authenticate('local', {
    successRedirect: '/', 
    failureFlash: true,
    failureRedirect: '/login?fail=true'
  }));
}