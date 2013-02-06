exports.init = function (compound) {
    app = compound.app;
    
    var passport = require('passport')
      , GoogleStrategy = require('passport-google').Strategy;
    
    passport.use(new GoogleStrategy({
        returnURL: 'http://localhost:3000/auth/google/return',
        realm: 'http://localhost:3000/',
        profile: true
      },
      function(identifier, profile, done) {
        compound.models.User.findOrCreate({
          openId: identifier,
          profile: profile
        }, function(err, user) {
          done(err, user);
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
      passport.authenticate('google', { successRedirect: '/',
      failureRedirect: '/login' }));
}