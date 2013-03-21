load('application');

var getAssociated = use('getAssociated');

before(loadUser, {
	only: ['show']
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
			redirect(path_to.users);
		} else {
			this.user = user;
			next();
		}
	}.bind(this));
}