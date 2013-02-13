exports.routes = function (map) {

	map.resources('posts');
	map.resources('users');
  
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
