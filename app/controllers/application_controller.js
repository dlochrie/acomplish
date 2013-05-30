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
before(loadAbilities);

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
					id: user.id
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

	function getRole(membership) {
		if (membership) {
			membership.role(function(err, role) {
				session.user.roles.push(role.name);
				return getRole(memberships.shift());
			});
		} else {
			next();
		}
	}

	// As a security precaution, reset the user's roles.
	session.user.roles = [];
	Membership.all({where: {userId: session.user.id}}, 
	function getMemberships(err, memberships) {
		if (err) return next();
		function getRole(membership) {
			if (membership) {
				membership.role(function(err, role) {
					session.user.roles.push(role.name);
					return getRole(memberships.shift());
				});
			} else {
				next();
			}
		}
		getRole(memberships.shift())
	});	
}

/**
 * This function requires Acomplish ACL to be loaded,
 * and that Roles are available.
 */
function loadAbilities() {
	var loggedIn = (session.passport.user) ? true : false;
	if (!loggedIn) return next(); 

	var acl = compound.acomplish.acl || false,
		user_roles = session.user.roles,
		user_abilities = {};

	/**
	 * Add the user's abilities according to thier roles.
	 */
	for (role in acl) {
		if (user_roles.indexOf(role) !== -1) {
			var abilities = acl[role].abilities;
			abilities.forEach(function(ability) {
				var ctrl = ability.controller;
				if (user_abilities[ctrl]) {
					if (user_abilities[ctrl].indexOf('*') !== -1) return '*'; 
					user_abilities[ctrl] = merge(user_abilities[ctrl]
						.concat(ability.actions));
				} else {
					user_abilities[ctrl] = ability.actions;
				}
			});
		}
	}	

	console.log('session', session)

	logToWindow('You have the following roles: <pre>' + 
		JSON.stringify(user_roles) + '</pre>');

	logToWindow('You have the following abilities: <pre>' + 
		JSON.stringify(user_abilities) + '</pre>');
	
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
 * Initialize Logger.
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
 * Util method for merging an array removing duplicates.
 * @param {Array} array Array to merge.
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