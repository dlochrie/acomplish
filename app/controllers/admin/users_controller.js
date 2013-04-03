load('application');

var getAssociated = use('getAssociated');

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
	this.membership = new Membership;

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
	var assigned = memberships.map(function(val, i, arr) {
			return arr[i].role.id;
	});
	Role.all(function(err, roles) {
		this.roles = [];
		Object.getOwnPropertyNames(roles).forEach(function(val, i, arr) {
			if (val === 'length') return; // We only want Values, not Count
			if (assigned.indexOf(roles[val].id) !== -1) return; // Skip Roles already assigned
			this.roles.push({ name: roles[val].name, _id: roles[val].id });
		});
		cb(this.roles)
	});	
}

