exports.init = function (compound, acomplish) {
	app = compound.app;

	console.log('acomplish', acomplish);

	var passport = require('passport'),
		GoogleStrategy = require('passport-google').Strategy,
		//conf = require('cjson').load('./config/passport.json'),
		//env = app.settings.env;
		conf = app.acomplish.passport;

	// Set conf based on environment
	console.log('conf', conf);

	passport.use(new GoogleStrategy({
		returnURL: conf.host + conf.path + 'auth/google/return',
		realm: conf.host + conf.path,
		profile: true
	}, function (identifier, profile, done) {
		compound.models.User.findOrCreate({
			openId: identifier,
			profile: profile
		}, function (err, user) {
			done(err, user);
		});
	}));

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
}