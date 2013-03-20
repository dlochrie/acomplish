load('application');

var getAssociated = use('getAssociated');

before(loadComment, {
	only: ['show', 'edit', 'update', 'destroy']
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
					flash('error', 'Can not destroy Comment');
				} else {
					flash('info', 'Comment successfully removed');
				}
				send("'" + path_to.admin_comments + "'");
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