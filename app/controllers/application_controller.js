before('protect from forgery', function () {
	protectFromForgery('4f66d4b328383823a9acefbc03891493c2b60366f');
});

before(loadPassport);
before(loadRoles);

publish('loadAuthor', loadAuthor);
publish('requireAdmin', requireAdmin);
publish('getAssociated', getAssociated);

function loadPassport() {
	this.userName = false;
	this.userId = false;
	this._loggedIn = false;
	if (session.passport.user) {
		User.find(session.passport.user, function(err, user) {
			if (!err || user) {
				this.userName = user.displayName;
				this.userId = user.id;
				this._loggedIn = true;
				next();
			}
		}.bind(this));
	} else {
		next();
	}
}

/**
 * Load all Roles into session for quick
 * validations
 *
 * TODO: This is at best a *HACK*, because: 
 * (1) roles can change at any time
 * (2) this is not an elegant way of handling ACL 
 * (3) Why would you run this on every page load???
 * (4) Which one of these is an 'Admin' role???
 */
function loadRoles() {
	if (this._roles) next(); 
	var self = this;
	self._roles = {};

	Role.all(function (err, roles) {	
		if (err) next();
		roles.forEach(function (role) {
			self._roles[parseInt(role.id)] = role.name;
		});
		next();
	}.bind(self));	
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
 * When called, checks that a User is:
 * (1) Logged In
 * (2) Belongs to a valid Admin Role: see `loadRoles`
 */
function requireAdmin() {
	var self = this,
		roles = Object.keys(self._roles) || false;

	if (!self._loggedIn) return reject(); 

	function reject () {		
		flash('error', 'You are not authorized for that action.');
		redirect(pathTo.root());
	}

	function validate (membership) {
		if (!membership) return reject();
		if (roles.indexOf(membership.roleId.toString()) !== -1) {
			return next();
		} else {
			return validate(membership);
		}
	}
	
	Membership.all({ where: { userId: self.userId }}, function (err, memberships) {
		if (err) return reject();
		return validate(memberships.shift())
	});
}

/**
 * This method joins asscoiated models and allows
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