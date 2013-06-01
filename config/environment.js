module.exports = function(compound) {

	var express = require('express');
	app = compound.app,
	passport = require('passport'),
	acomplish = require('./acomplish');
	auth = require('./passport.js'),
	
	app.configure(function () {
		app.use(express.static(app.root + '/public', {
			maxAge: 86400000
		}));
		app.set('view engine', 'ejs');
		app.set('view options', {
			complexNames: true
		});
		app.set('jsDirectory', '/javascripts/');
		app.set('cssDirectory', '/stylesheets/');
		app.set('cssEngine', 'stylus');
		// make sure you run `npm install railway-routes browserify`
		// app.enable('clientside');
		app.use(express.bodyParser());
		app.use(express.cookieParser('secret'));
		app.use(express.session({
			secret: 'secret'
		}));
		app.use(express.methodOverride());

		/** acomplish **/
		app.use(acomplish.init(compound));

		/**
		 * Initialize Passport Sessions, then Setup Passport
		 * This MUST Be done in the right order, and BEFORE
		 * the `app.router`
		 */
		app.use(passport.initialize());
		app.use(passport.session());
		
		/** Must be called after ACL **/
		auth.init(compound);

		app.use(app.router);
	});

}