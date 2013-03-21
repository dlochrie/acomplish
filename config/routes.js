exports.routes = function (map) {

	/** Set up Publicly Exposed Routes **/
	map.resources('comments', { only: ['index', 'show'] });
	map.resources('users', { only: ['index', 'show'] }); 
	map.resources('posts', { only: ['index', 'show'] }, function (post) { 
		post.resources('comments', { only: ['create', 'index'] });
	});

	/** Set up Admin Namespace **/
	map.get('/admin', 'admin#index');
	map.namespace('admin', function (admin) {
		map.resources('comments');
		map.resources('posts');
		map.resources('roles');
		map.resources('users', function(user) {
			user.resources('memberships');
		});
	});

	map.get('/login', 'account#login');
	map.get('/logout', 'account#logout');

	/** Boilerplate / Msic **/
	map.get('/about', 'main#about');
	map.get('/contact', 'main#contact');
	map.root('main#index');
};