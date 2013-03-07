exports.routes = function (map) {

	map.resources('comments');

	map.resources('posts'); // TODO Nest under `Admin` Namespace
	map.resources('users', function(user) {
		user.resources('memberships');
	});

	map.resources('roles'); // TODO Nest under `Admin` Namespace
	//map.resources('memberships'); // TODO Nest under `Admin` Namespace

	// Generic routes. Add all your routes below this line
	// feel free to remove generic routes
	map.all(':controller/:action');
	map.all(':controller/:action/:id');

	map.get('/login', 'account#login');
	map.get('/logout', 'account#logout');

	map.get('/about', 'main#about');
	map.get('/contact', 'main#contact');

	map.root('main#index');
};