load('application');

var getAssociated = use('getAssociated');

//before(use('authorize'));

before(loadMembership, {
	only: ['show', 'edit', 'update', 'destroy']
});

action('new', function () {
	this.title = 'New Membership';
	this.membership = new Membership;
	
  // TODO: We should really have some error-handling here...
  generateRoleSelect(function() {
    generateUserSelect(function() {
      render();
    })
  });
	
});

action(function create() {

	var membership = req.body.Membership;
	membership.created_at = new Date;
	membership.updated_at = new Date;
	membership.userId = req.params.user_id;
	membership.userId = req.params.user_id;


	Membership.create(membership, function (err, membership) {
		respondTo(function (format) {
			format.json(function () {
				if (err) {
					send({
						code: 500,
						error: membership && membership.errors || err
					});
				} else {
					send({
						code: 200,
						data: membership.toObject()
					});
				}
			});
			format.html(function () {
				if (err) {
					flash('error', 'Membership can not be created');
					render('new', {
						membership: membership,
						title: 'New post'
					});
				} else {
					flash('info', 'Membership created');
					redirect(path_to.edit_admin_user(membership.userId));
				}
			});
		});
	});
});

action(function index() {
	this.title = 'Memberships index';
	Membership.all(function (err, memberships) {		
		getAssociated(memberships, 'user', false, 'membership', function(results) {
			getAssociated(results, 'role', true, 'membership', function(results) {
				switch (params.format) {
					case "json":
						send({code: 200, data: memberships});
						break;
					default:
						render({ results: results });
				}
			})
		})
	});
});

action(function destroy() {
	var membership = this.membership;
	membership.destroy(function (error) {
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
					flash('error', 'Can not destroy membership');
				} else {
					flash('info', 'Membership successfully removed');
				}
				send("'" + path_to.edit_admin_user(membership.userId) + "'");
			});
		});
	});
});

function loadMembership() {
	Membership.find(params.id, function (err, membership) {
		if (err || !membership) {
			if (!err && !membership && params.format === 'json') {
				return send({
					code: 404,
					error: 'Not found'
				});
			}
			redirect(path_to.users);
		} else {
			this.membership = membership;
			next();
		}
	}.bind(this));
}

function generateRoleSelect(cb) {
	Role.all(function(err, roles) {
		this.roles = [];
		Object.getOwnPropertyNames(roles).forEach(function(val, idx, array) {
			if (val === 'length') return; // We only want Values, not Count
			this.roles.push({ name: roles[val].name, _id: roles[val].id });
		});
		cb(this.roles)
	});	
}

function generateUserSelect(cb) {
	User.all(function(err, users) {
		this.users = [];
		Object.getOwnPropertyNames(users).forEach(function(val, idx, array) {
			if (val === 'length') return; // We only want Values, not Count
			this.users.push({ name: users[val].displayName, _id: users[val].id });
		});
		cb(this.users)
	});	
}