before('protect from forgery', function () {
	protectFromForgery('4f66d4b328383823a9acefbc03891493c2b60366f');
});

// (1) Initialize Logger - For Debugging
before(initLogger);

// (2) Load Passport (User)
before(loadPassport);

// (3) Init ACL
before('initACL', function () {
	loggedIn = loggedIn || false,
	acl = compound.acomplish.acl || false,
	cacheRoles = false,
	cacheAbilities = false;

	if (!acl) return next();

	systemRoles = acl.roles || [];
	if (acl.settings) {
		cacheRoles = (acl.settings.cacheRoles) ? true : false;
		cacheAbilities = (acl.settings.cacheAbilities) ? true : false;
	}
	next();
});

// (4) Load Roles
before(loadRoles);

// (5) Load Abilities (Requires #2 & #3)
before(loadAbilities);

publish('loadAuthor', loadAuthor);
publish('getAssociated', getAssociated);
publish('authorize', authorize);

function authorize(req) {
	var actn = req.actionName,
    ctrl = req.controllerName,
    path = context.req.url; // TODO: Is this the best way to get URL?

  if (path === '/' || !loggedIn) return reject();
  function reject() {
    flash('error', 'You are not authorized for this action.');
    redirect(path_to.root);
  }

  /*
  console.log("ACL:\n", 'Does[', this.user.name, '] have the Ability to ' +
    '[', actn, '] in [', ctrl, '] ??');
	*/

  var userAbilities = this.user.abilities || {};
  if (userAbilities[ctrl]) {
    if (userAbilities[ctrl] === "*") {
      return next()
    } else if (-1 !== userAbilities[ctrl].indexOf(actn)) {
      return next()
    }
  }

  // No rules matched, User is Unauthorized.
  return reject();
}

/**
 * TODO: This should be loadUser, or loadUserPassport
 */
function loadPassport() {
	var self = this;

	// This variable belongs to the global scope.
	loggedIn = (session.passport.user) ? true : false;
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
 * Load all Roles into session for quick validations. 
 * We do this ON EVERY page load in case a user's roles changes, 
 * unless Caching is turned in in the conf.
 */
function loadRoles() {
	if (!loggedIn) return next(); 
	if (cacheRoles && session.user.roles) return next();

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
	if (!loggedIn) return next(); 
	if (cacheAbilities && session.user.abilities) return next();

	var userRoles = session.user.roles,
		userAbilities = {};

	for (role in systemRoles) {
		if (userRoles.indexOf(role) !== -1) {
			var abilities = systemRoles[role].abilities;
			abilities.forEach(function(ability) {
				var ctrl = ability.controller;
				if (userAbilities[ctrl]) {
					if (userAbilities[ctrl].indexOf('*') !== -1) return '*'; 
					userAbilities[ctrl] = merge(userAbilities[ctrl]
						.concat(ability.actions));
				} else {
					userAbilities[ctrl] = ability.actions;
				}
			});
		}
	}	
	session.user.abilities = userAbilities;
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
		var acomplish = req.acomplish || false;
		if (!acomplish) {
			req.acomplish = {log: []};
		} else {
			req.acomplish.log = req.acomplish.log || [];
		}
	} else {
		req.acomplish = {log: false};
	}	
	next();	
}

/**
 * This custom method logs a message to the 
 * app window.
 * ONLY works in the development environment.
 * @param {*} msg String or Array of messages.
 */
function logToWindow(msg) {
	if (Object.prototype.toString.call(msg) === '[object Array]')
		msg = msg.join(' ');
	if (req.acomplish.log) {
		var msg = String('<strong>Debug Message</strong>: <em>' + msg + '</em>');
		req.acomplish.log.push(msg);
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