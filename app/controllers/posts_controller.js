load('application');

var getAssociated = use('getAssociated');

before(loadPost, {
	only: ['show']
});

before(use('loadAuthor'), { only: ['show'] });

action(function index() {
	this.title = 'Posts index';
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
	
	post.author(function(err, author) {
		if (err) { 
			flash('info', 'Post could not be found');
			redirect(pathTo.root); 
		}
		post.comments(function(err, comments) {
			if (err) { 
				flash('info', 'Post could not be found');
				redirect(pathTo.root); 
			}
			comments = comments;
			render({ post: post, author: author, comment: comment, 
				comments: comments, commentor: commentor })
		})
	})
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