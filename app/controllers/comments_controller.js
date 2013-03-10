load('application');

var getAssociated = use('getAssociated');

before(loadComment, {
	only: ['show', 'edit', 'update', 'destroy']
});

before(use('loadAuthor'), { only: ['new', 'edit'] });

action(function create() {
	if (!session.passport.user)
		next();
	var comment = req.body.Comment;
	comment.created_at = new Date;
	comment.updated_at = new Date;
	comment.userId = session.passport.user;
	comment.body = sanitizeComment(req.body.Comment.body);
	
	Comment.create(comment, function (err, comment) {
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

/**
* See http://stackoverflow.com/questions/822452/strip-html-from-text-javascript
* for reference to origin of this method
*/
function sanitizeComment(str) {
  str=str.replace(/<\s*br\/*>/gi, "\n"); // Replace breaks with new lines
  str=str.replace(/<\s*a.*href="(.*?)".*>(.*?)<\/a>/gi, " $2 (Link->$1) "); // Reformat links, removing tags but keeping reference
  str=str.replace(/<\s*\/*.+?>/ig, "\n"); // strip the rest of the HTML tags
  str=str.replace(/ {2,}/gi, " "); // 2 (or more) spaces equals a space - trim
  str=str.replace(/\n+\s*/gi, "\n\n"); // More than one new-line chars equals 2 new-lines
  str=str.replace(/\n/g, "<br />"); // Add the breaks again -- this *could* be a <p> replace.
  str=str.replace(/\*(.*?)\*/g, "<strong>$1</strong>"); // If text is wrapped in asterisks, then wrap in bold
  str=str.replace(/_(.*?)_/g, "<em>$1</em>"); // If text is wrapped in undescores, then wrap in italics
  return str;
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