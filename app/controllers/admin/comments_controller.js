load('application');

before(loadComment, {only: ['show', 'destroy']});
before(use('checkRole'));

/*
action(function index() {
  this.title = 'Comment Management';
  Comment.all(function (err, comments) {
    render({
      comments: comments
    });
  });
});
*/

action(function index() {
  this.title = 'Comment Management';
	var result = {};
	result.comments = [];

/*
	var finishRequest = function(result) {
		render({ comments: result.comments });
	}

	var getComments = function(fn) {
		comments = Comment.all(function (err, comments) {
			if (err) { return fn && fn(err, null); }
			return fn && fn(null, comments);
		});
	}

	var getCommentsUser = function(comment, fn) {
		User.find(userId, function(err, user) {
			if (err) { return fn && fn(err, null);
			return fn && fn(null, comments);
		});
	}

	var getCommentsPost = function(comment, fn) {
		Post.find(postId, function(err, post) {
			if (err) { return fn && fn(err, null);
			return fn && fn(null, comments);
		});
	}
	
	getComments(function (err, comments) {
		if (err) { send ("No COMMENTS!"); }
		comments.forEach(function(comment) {
			result.comments[comment.id].user = getCommentsUser(this); 
			result.comments[comment.id].post = getCommentsPost(this); 
			finishRequest(result);
		});
	}
*/
});


action(function show() {
  this.title = 'Showing Comment';
  
  // Get the Author of this Comment
  User.find(this.comment.userId, function (err, user) {
    if (!err || user) {
     this.user = user;
     next();
   }
  }.bind(this));
  
  // Get the Post that this Comment is referenced on
  Post.find(this.comment.postId, function (err, post) {
    render({ post: post});
  });
    
});

action(function destroy() {
  this.comment.destroy(function (error) {
    if (error) {
      flash('error', 'Can not destroy comment');
    } else {
      flash('info', 'Comment successfully removed');
    }
    send("'" + path_to.admin_comments() + "'");
  });
});

function loadComment() {
  Comment.find(params.id, function (err, comment) {
    if (err || !comment) {
       redirect(path_to.admin_comments());
    } else {
      this.comment = comment;
      next();
    }
  }.bind(this));
}
