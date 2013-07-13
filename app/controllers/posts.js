var Application = require('./application'),
  appCtrl;

module.exports = PostsController;

function PostsController(init) {
  Application.call(this, init);


  appCtrl = new Application(init);
  init.before(loadPost, {only: ['show']});
  /*
  init.before(function(ctl) {
    loadAuthor;
  }, {only: ['show']});
  */
}

require('util').inherits(PostsController, Application);

PostsController.prototype.index = function index(c) {
  this.title = 'Posts index';
  c.Post.all(function (err, posts) {    
    appCtrl.getAssociated(posts, 'author', false, 'post', function(results) {
      appCtrl.getAssociated(results, 'comments', true, 'post', function(results) {
        c.respondTo(function(format) {
          format.json(function () {
            c.send(err ? {
              code: 500,
              error: err
            }: {
              code: 200,
              data: results
            });
          });
          format.html(function () {
            c.render({results: results});
          });
        })
      });
    })
  });
}

PostsController.prototype.show = function show(c) {
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
}

function loadPost(c) {
  var self = this;
  c.Post.find(c.params.id, function (err, post) {
    if (err || !post) {
      if (!err && !post && c.params.format === 'json') {
        return c.send({
          code: 404,
          error: 'Not found'
        });
      }
      c.redirect(path_to.posts);
    } else {
      self.post = post;
      c.next();
    }
  });
}