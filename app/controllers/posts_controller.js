load('application');

before(loadPost, {
	only: ['show', 'edit', 'update', 'destroy']
});

before(use('loadAuthor'), { only: ['new', 'edit'] });

action('new', function () {
	this.title = 'New post';
	this.post = new Post;
	if (this.author) {
		generateAuthorSelect(this.author, function(opts) {
			render();
		});
	} else {
		flash('error', 'Could not retrieve your User information, are you logged in?');
		redirect(path_to.posts);
	}
});

action(function create() {
	Post.create(req.body.Post, function (err, post) {
		respondTo(function (format) {
			format.json(function () {
				if (err) {
					send({
						code: 500,
						error: post && post.errors || err
					});
				} else {
					send({
						code: 200,
						data: post.toObject()
					});
				}
			});
			format.html(function () {
				if (err) {
					flash('error', 'Post can not be created');
					render('new', {
						post: post,
						title: 'New post'
					});
				} else {
					flash('info', 'Post created');
					redirect(path_to.posts);
				}
			});
		});
	});
});

action(function index() {
	this.title = 'Posts index';
	Post.all({ include: ['author', 'comments'] }, function (err, posts) {
		switch (params.format) {
			case "json":
				send({code: 200, data: posts});
				break;
			default:
				render({
					posts: posts
				});
		}
	});
});

action(function show() {
	this.title = this.post.title
	var post = this.post
		, author
		, comments;
	
	post.author(function(err, author) {
		if (err) { console.log("Error!!!!!", err); }
		post.comments(function(err, comments) {
			if (err) { console.log("Error!!!!!", err); }
			comments = comments;
			render({ post: post, author: author, comments: comments })
		})
	})
	
});

action(function edit() {
	this.title = 'Post edit';
	if (this.author) {
		generateAuthorSelect(this.author, function(opts) {
			switch (params.format) {
				case "json":
					send(this.post);
					break;
				default:
					render();
			}
		});
	} else {
		flash('error', 'Could not retrieve your User information, are you logged in?');
		redirect(path_to.posts);
	}	
	
});

action(function update() {
	var post = this.post;
	this.title = 'Edit post details';
	this.post.updateAttributes(body.Post, function (err) {
		respondTo(function (format) {
			format.json(function () {
				if (err) {
					send({
						code: 500,
						error: post && post.errors || err
					});
				} else {
					send({
						code: 200,
						data: post
					});
				}
			});
			format.html(function () {
				if (!err) {
					flash('info', 'Post updated');
					redirect(path_to.post(post));
				} else {
					flash('error', 'Post can not be updated');
					render('edit');
				}
			});
		});
	});
});

action(function destroy() {
	this.post.destroy(function (error) {
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
					flash('error', 'Can not destroy post');
				} else {
					flash('info', 'Post successfully removed');
				}
				send("'" + path_to.posts + "'");
			});
		});
	});
});

function loadPost() {
	Post.find(params.id, function (err, post) {
		if (err || !post) {
			if (!err && !post && params.format === 'json') {
				return send({
					code: 404,
					error: 'Not found'
				});
			}
			redirect(path_to.posts);
		} else {
			this.post = post;
			next();
		}
	}.bind(this));
}

function generateAuthorSelect(user, cb) {
	User.all(function(err, users) {
		this.opts = [];
		Object.getOwnPropertyNames(users).forEach(function(val, idx, array) {
			if (val === 'length') return; // We only want Values, not Count
			this.opts.push({ name: users[val].displayName, _id: users[val].id });
		});
		cb(this.opts)
	});	
}
