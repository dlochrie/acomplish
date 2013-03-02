load('application');

var getAssociated = use('getAssociated');

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
	Membership.create(req.body.Membership, function (err, membership) {
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
					redirect(path_to.memberships);
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