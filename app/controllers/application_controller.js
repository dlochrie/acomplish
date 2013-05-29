before('protect from forgery', function () {
	protectFromForgery('4f66d4b328383823a9acefbc03891493c2b60366f');
});

// (1) Initialize Logger - For Debugging
before(initLogger);

// (2) Load Passport (User)
before(loadPassport);

// (3) Load Roles
before(loadRoles);

// (4) Load Abilities (Requires #2 & #3)
//before(loadAbilities);

before(function authorize(req) {
	var user = this.user || false;
	
	acl.authorize(req, user, function(auth) {
		logToWindow('is user authorized?', auth) 
		next() 
	});
});

publish('loadAuthor', loadAuthor);

publish('getAssociated', getAssociated);

function loadPassport() {
	var self = this;

	var loggedIn = (session.passport.user) ? true : false;
	if (loggedIn && session.user) { 
		self.user = session.user;
		logToWindow('You are logged in, nothing more to do.');
		return next(); 
	}

	self.user = false;
	session.user = false;
	logToWindow('You are NOT logged in, set all user info to false.');

	if (session.passport.user) {
		logToWindow('You are NOT logged in, going to look your user up in the DB.');
		User.find(session.passport.user, function(err, user) {
			if (!err || user) {
				logToWindow('Found you, Chief. You are now logged in.');
				session.user = {
					name: user.displayName,
					email: user.email,
					id: user.id,
					roles: []
				}
				self.user = session.user;
				next();
			}
		}.bind(self));
	} else {
		next();
	}
}

/**
 * Load all Roles into session for quick
 * validations. We do this ON EVERY page load
 * in case a user's roles changes.
 */
function loadRoles() {
	var loggedIn = (session.passport.user) ? true : false;
	if (!loggedIn) return next(); 

	logToWindow('You have the following roles:', 
		String(session.user.roles.join(',')));
	console.log('You have the following roles:', session.user.roles);
	Role.all(function (err, roles) {	
		if (err) return next();
		roles.forEach(function(role) {
			session.user.roles.push(role.name);
		});
		next();
	}.bind(this));	
}

/**
 * This function requires Acomplish ACL to be loaded,
 * and that Roles are available.
 */
function loadAbilities() {
	var acl = compound.acomplish.acl || false;
	user_abilities = {};

	for (role in acl) {
		var abilities = acl[role].abilities;
		abilities.forEach(function(ability) {
			var ctrl = ability.controller;
			if (user_abilities[ctrl]) {
				user_abilities[ctrl] = merge(user_abilities[ctrl]
					.concat(ability.actions));
			} else {
				user_abilities[ctrl] = ability.actions;
			}
		});
	}
	console.log('You have the following abilities:', user_abilities);
	//logToWindow('You have the following abilities:', user_abilities);
	session.user.abilities = user_abilities;
	next();
}

/**
 * Convienience method for loading Author, Posts and Comments
 */
function loadAuthor() {
	this.author = null;
	if (this.userId)
		this.author = { name: this.userName, id: this.userId };
	next();
}

/**
 * This method joins associated models and allows
 * them to accessed like:
 * user.role.name
 * post.user.displayName
 */
function getAssociated(models, assoc, multi, modelName, cb) {
	var results = [];
	
	function makeAssoc(model, assoc, callback) {		
		model = (multi) ? model[modelName] : model;
		model[assoc](function (err, assoc) {
			callback(assoc);
		})
	}
	
	function findAssoc(model) {
		if (model) {
			makeAssoc(model, assoc, function (result) {
				var obj = {};				
				if (!multi) {
					obj[modelName] = model;
				} else {
					obj = model;
				}
				obj[String(assoc)] = result;
				results.push(obj);
				return findAssoc(models.shift());
			});
		} else {
			return cb(results);
		}
	}
	
	findAssoc(models.shift());
}

/**
 * Log to the Window
 */
function initLogger() {
	var env = app.settings.env || false;
	if (env && env === 'development') {
		var sig = req.signature || false;
		if (!sig) {
			req.signature = { log: [] };
		} else {
			req.signature.log = req.signature.log || [];
		}
	} else {
		req.signature = { log: false };
	}	
	next();	
}

/**
 * This custom method logs a message to the 
 * app window.
 * ONLY works in the development environment.
 */
function logToWindow(msg) {
	if (req.signature.log) {
		var msg = String('<strong>Debug Message</strong>: <em>' + msg + '</em>');
		req.signature.log.push(msg);
	}
}

/**
 * Util method for merging two arrays
 */
function merge(array) {
	var a = array.concat();
	for (var i=0; i<a.length; ++i) {
		for (var j=i+1; j<a.length; ++j) {
		if (a[i] === a[j])
			a.splice(j--, 1);
		}
	}
	return a;
}