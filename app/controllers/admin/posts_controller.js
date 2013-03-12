load('application');

var getAssociated = use('getAssociated');

before(loadPost, {
	only: ['show', 'edit', 'update', 'destroy']
});

before(use('loadAuthor'), { only: ['new', 'edit', 'show'] });

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
	post.created_at = new Date;
	post.updated_at = new Date;
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
	this.title = 'Manage Posts';
	Post.all(function (err, posts) {		
		getAssociated(posts, 'author', false, 'post', function(results) {
			getAssociated(results, 'comments', true, 'post', function(results) {
				switch (params.format) {
					case "json":
						send({code: 200, data: posts});
						break;
					default:
						render({ results: results });
				}
			})
		})
	});
});

action(function show() {
	this.title = this.post.title;
	var post = this.post
		, author
		, comment = new Comment
		, comments
		, commentor = this.author
	
	// TODO: Handle "err"'s here
	post.author(function(err, author) {
		if (err) { console.log("Error!!!!!", err); }
		post.comments(function(err, comments) {
			if (err) { console.log("Error!!!!!", err); }
			comments = comments;
			render({ post: post, author: author, comment: comment, 
				comments: comments, commentor: commentor })
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
	body.Post.updated_at = new Date;
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
	
	/** Remove Related Comments **/
	Comment.all({ where: { postId: this.post.id }},
	function(err, comments) {
		comments.forEach(function(comment) {
			comment.destroy(function(error) { });
		});
	});
	
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
