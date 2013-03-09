load('application');

var getAssociated = use('getAssociated');

before(loadComment, {
	only: ['show', 'edit', 'update', 'destroy']
});

before(use('loadAuthor'), { only: ['new', 'edit'] });

action(function create() {
	Comment.create(req.body.Comment, function (err, comment) {
		respondTo(function (format) {
			format.json(function () {
				if (err) {
					send({
						code: 500,
						error: comment && comment.errors || err
					});
				} else {
					send({
						code: 200,
						data: comment.toObject()
					});
				}
			});
			format.html(function () {
				if (err) {
					flash('error', 'Comment can not be created');
					render('new', {
						comment: comment,
						title: 'New comment'
					});
				} else {
					flash('info', 'Comment created');
					redirect(path_to.comments);
				}
			});
		});
	});
});


action(function index() {
	this.title = 'Comments index';
	Comment.all({ include: ['author', 'post']}, function (err, comments) {
		getAssociated(comments, 'author', false, 'comment', function (results) {
			getAssociated(results, 'post', true, 'comment', function (results) {
				switch (params.format) {
					case "json":
						send({
							code: 200,
							data: results
						});
						break;
					default:
						render({
							results: results
						});
				}
			})
		});
	});
});

action(function show() {
	this.title = 'Comment show';
	switch (params.format) {
		case "json":
			send({
				code: 200,
				data: this.comment
			});
			break;
		default:
			render();
	}
});

action(function edit() {
	this.title = 'Comment edit';
	switch (params.format) {
		case "json":
			send(this.comment);
			break;
		default:
			render();
	}
});

action(function update() {
	var comment = this.comment;
	this.title = 'Edit comment details';
	this.comment.updateAttributes(body.Comment, function (err) {
		respondTo(function (format) {
			format.json(function () {
				if (err) {
					send({
						code: 500,
						error: comment && comment.errors || err
					});
				} else {
					send({
						code: 200,
						data: comment
					});
				}
			});
			format.html(function () {
				if (!err) {
					flash('info', 'Comment updated');
					redirect(path_to.comment(comment));
				} else {
					flash('error', 'Comment can not be updated');
					render('edit');
				}
			});
		});
	});
});

action(function destroy() {
	this.comment.destroy(function (error) {
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
					flash('error', 'Can not destroy comment');
				} else {
					flash('info', 'Comment successfully removed');
				}
				send("'" + path_to.comments + "'");
			});
		});
	});
});

function loadComment() {
	Comment.find(params.id, function (err, comment) {
		if (err || !comment) {
			if (!err && !comment && params.format === 'json') {
				return send({
					code: 404,
					error: 'Not found'
				});
			}
			redirect(path_to.comments);
		} else {
			this.comment = comment;
			next();
		}
	}.bind(this));
}

function generateAuthorSelect(user, cb) {
	User.all(function(err, users) {
		this.user_opts = [];
		Object.getOwnPropertyNames(users).forEach(function(val, idx, array) {
			if (val === 'length') return; // We only want Values, not Count
			this.user_opts.push({ name: users[val].displayName, _id: users[val].id });
		});
		cb(this.user_opts)
	});	
}

function generatePostSelect(cb) {
	Post.all(function(err, posts) {
		this.post_opts = [];
		Object.getOwnPropertyNames(posts).forEach(function(val, idx, array) {
			if (val === 'length') return; // We only want Values, not Count
			this.post_opts.push({ name: posts[val].title, _id: posts[val].id });
		});
		cb(this.post_opts)
	});	
}