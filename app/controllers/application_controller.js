before('protect from forgery', function () {
  protectFromForgery('4f66d4b797766cca9acefbc03891493c2b60366f');
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
 */
function loadRoles() {
	if (this._roles) next(); 
	var self = this;
	self._roles = {};

	Role.all(function (err, roles) {	
		if (err) next();
		roles.forEach(function (role) {
			self._roles[role.id] = role.name;
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
	var self = this;

	function reject () {
		flash('error', 'This action is restricted.');
		redirect(pathTo.root);
	}

	if (!session.passport.user) reject();

	if (self._loggedIn) {
		console.log('roles', self._roles);
		var roles = Object.keys(self._roles) || false;
		// Check if User has Role-Membership
		Membership.all({ where: { userId: self.userId }}, function (err, memberships) {
			if (err) reject();
			console.log('memberships', memberships);
			memberships.forEach(function(membership) {
				console.log('Is', membership.roleId, 'in ', roles, '?');
				console.log(roles.indexOf(membership.roleId.toString()));
				if (roles.indexOf(membership.roleId.toString()) !== -1) {
					console.log('User is Admin!!!!');
					return false;next();
				}
			});
		});
	}
	reject();
}

function getAssociated(models, assoc, multi, modelName, cb) {
	var results = [];
	
	function async(model, assoc, callback) {		
		model = (multi) ? model[modelName] : model;
		model[assoc](function (err, assoc) {
			callback(assoc);
		})
	}
	
	function series(model) {
		if (model) {
			async(model, assoc, function (result) {
				var obj = {};
				
				if (!multi) 
					obj[modelName] = model;
				else
					obj = model;
					
				obj[String(assoc)] = result;
				results.push(obj);
				return series(models.shift());
			});
		} else {
			return cb(results);
		}
	}
	
	series(models.shift());
}