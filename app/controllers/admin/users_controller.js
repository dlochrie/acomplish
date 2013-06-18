load('application');

var getAssociated = use('getAssociated');

//before(use('authorize'));

before(loadUser, {
	only: ['show', 'edit', 'update', 'destroy']
});

action('new', function () {
	this.title = 'New user';
	this.user = new User;
	render();
});

action(function create() {
	User.create(req.body.User, function (err, user) {
		respondTo(function (format) {
			format.json(function () {
				if (err) {
					send({
						code: 500,
						error: user && user.errors || err
					});
				} else {
					send({
						code: 200,
						data: user.toObject()
					});
				}
			});
			format.html(function () {
				if (err) {
					flash('error', 'User can not be created');
					render('new', {
						user: user,
						title: 'New user'
					});
				} else {
					flash('info', 'User created');
					redirect(path_to.admin_users);
				}
			});
		});
	});
});

action(function index() {
	this.title = 'Users index';
	User.all(function (err, users) {
		/**
		 * TODO: Need to add a method that parses Role Names
		 * for each User's Memberships
		 */ 
		getAssociated(users, 'memberships', false, 'user', function(results) {
			switch (params.format) {
				case "json":
					send({
						code: 200,
						data: users
					});
					break;
				default:
					render({
						rows: results
					});
			}
		});
	});
});

action('show', function () {
	this.title = 'User show';
	switch (params.format) {
		case "json":
			send({
				code: 200,
				data: this.user
			});
			break;
		default:
			render();
	}
});

action(function edit() {
	this.title = 'User edit';
	this.membership = new Membership();

/*
	Membership.all({ where: { userId: this.user.id }}, function(err, memberships) {
		getAssociated(memberships, 'role', false, 'membership', function(memberships) {
			this.memberships = memberships;
			generateRoleSelect(memberships, function() {
			  switch (params.format) {
					case "json":
						send(this.user);
						break;
					default:
						render();
				}
			});
		});
	});
*/

	Membership.all({ where: { userId: this.user.id }}, 
	function(err, memberships) {
		generateRoleSelect(memberships, function() {
			render();
		});
	});
});

action(function update() {
	var user = this.user;
	this.title = 'Edit user details';
	this.user.updateAttributes(body.User, function (err) {
		respondTo(function (format) {
			format.json(function () {
				if (err) {
					send({
						code: 500,
						error: user && user.errors || err
					});
				} else {
					send({
						code: 200,
						data: user
					});
				}
			});
			format.html(function () {
				if (!err) {
					flash('info', 'User updated');
					redirect(path_to.admin_user(user));
				} else {
					flash('error', 'User can not be updated');
					render('edit');
				}
			});
		});
	});
});

action(function destroy() {
	
	/** Remove Related Posts **/ 
	Post.all({ where: { userId: this.user.id }},
	function(err, posts) {
		posts.forEach(function(post) {
			post.destroy(function(error) { });
		});
	});
	
	/** Remove Related Comments **/
	Comment.all({ where: { userId: this.user.id }},
	function(err, comments) {
		comments.forEach(function(comment) {
			comment.destroy(function(error) { });
		});
	});
	
	this.user.destroy(function (error) {
		respondTo(function (format) {
			format.json(function () {
				if (error) {
					send({
						code: 500,
						error: error
					});
				} else {
					send({
						code: 200
					});
				}
			});
			format.html(function () {
				if (error) {
					flash('error', 'Can not destroy user');
				} else {
					flash('info', 'User successfully removed');
				}
				send("'" + path_to.admin_users + "'");
			});
		});
	});
});

function loadUser() {
	User.find(params.id, function (err, user) {
		if (err || !user) {
			if (!err && !user && params.format === 'json') {
				return send({
					code: 404,
					error: 'Not found'
				});
			}
			redirect(path_to.admin_users);
		} else {
			this.user = user;
			next();
		}
	}.bind(this));
}

function generateRoleSelect(memberships, cb) {
	/**
	 * Assume that the `key` is the JSON key in `acl.json`
	 * Get the assigned roles.
	 */
	var assigned = memberships.map(function(m) {
		return { name: acl.roles[m.roleName].displayName, 
				_id: m.roleName };
	});

	var available = [],	
		roles = Object.keys(acl.roles);

	console.log(roles);

	roles.forEach(function(role) {
		memberships.forEach(function(m) {
			console.log('is', role, 'in',  m.roleName)
			if (role !== m.roleName) {
				console.log('no, add it');
				available.push({ name: acl.roles[m.roleName].displayName, 
					_id: m.roleName });			
			}
		});
	});
	
	console.log('available', available)

	this.roles = available;
	this.memberships = assigned;

	/*
	console.log('all roles', roles);
	console.log('roles assigned', this.memberships);
	console.log('roles available', this.roles);
	*/

	var filter = this.memberships.filter(function(x) { return roles.indexOf(x) < 0 })
	console.log('filter', filter)

	return cb();
}

