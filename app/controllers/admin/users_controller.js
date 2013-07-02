load('application');


var getAssociated = use('getAssociated');


before(use('authorize'));
before(loadUser, {
  only: ['show', 'edit', 'update', 'destroy']
});


action('new', function () {
  this.title = 'New user';
  this.user = new User;
  render();
});

action(function create() {
  User.create(req.body.User, function (err, user) {
    respondTo(function (format) {
      format.json(function () {
        if (err) {
          send({
            code: 500,
            error: user && user.errors || err
          });
        } else {
          send({
            code: 200,
            data: user.toObject()
          });
        }
      });
      format.html(function () {
        if (err) {
          flash('error', 'User can not be created');
          render('new', {
            user: user,
            title: 'New user'
          });
        } else {
          flash('info', 'User created');
          redirect(path_to.admin_users);
        }
      });
    });
  });
});

action(function index() {
  this.title = 'Users index';
  User.all(function (err, users) {
    /**
     * TODO: Need to add a method that parses Role Names
     * for each User's Memberships
     */ 
    getAssociated(users, 'memberships', false, 'user', function(results) {
      switch (params.format) {
        case "json":
          send({
            code: 200,
            data: users
          });
          break;
        default:
          render({
            rows: results
          });
      }
    });
  });
});

action('show', function () {
  this.title = 'User show';
  switch (params.format) {
    case "json":
      send({
        code: 200,
        data: this.user
      });
      break;
    default:
      render();
  }
});

action(function edit() {
  this.title = 'Edit a User';

  // Make an instance of Membership available so that new ones can be added.
  this.membership = new Membership();
  
  Membership.all({where: {userId: this.user.id}}, 
  function(err, memberships) {
    generateRoleSelect(memberships, function() {
      render();
    });
  });
});

action(function update() {
  var user = this.user;
  this.title = 'Edit user details';
  this.user.updateAttributes(body.User, function (err) {
    respondTo(function (format) {
      format.json(function () {
        if (err) {
          send({
            code: 500,
            error: user && user.errors || err
          });
        } else {
          send({
            code: 200,
            data: user
          });
        }
      });
      format.html(function () {
        if (!err) {
          flash('info', 'User updated');
          redirect(path_to.admin_user(user));
        } else {
          flash('error', 'User can not be updated');
          render('edit');
        }
      });
    });
  });
});

action(function destroy() {
  
  /** Remove Related Posts **/ 
  Post.all({ where: { userId: this.user.id }},
  function(err, posts) {
    posts.forEach(function(post) {
      post.destroy(function(error) { });
    });
  });
  
  /** Remove Related Comments **/
  Comment.all({ where: { userId: this.user.id }},
  function(err, comments) {
    comments.forEach(function(comment) {
      comment.destroy(function(error) { });
    });
  });
  
  this.user.destroy(function (error) {
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
          flash('error', 'Can not destroy user');
        } else {
          flash('info', 'User successfully removed');
        }
        send("'" + path_to.admin_users + "'");
      });
    });
  });
});

function loadUser() {
  User.find(params.id, function (err, user) {
    if (err || !user) {
      if (!err && !user && params.format === 'json') {
        return send({
          code: 404,
          error: 'Not found'
        });
      }
      redirect(path_to.admin_users);
    } else {
      this.user = user;
      next();
    }
  }.bind(this));
}

function generateRoleSelect(memberships, cb) {
  var assigned = [],
    assigned_keys = [], 
    available = [],
    roles = Object.keys(acl.roles);
  
  memberships.forEach(function(m) {
    if (acl.roles[m.roleName]) {
      assigned_keys.push(m.roleName);
      assigned.push({name: acl.roles[m.roleName].displayName, mid: m.id, uid:
        m.userId});
    }
  });

  roles.forEach(function(role) {
    if (assigned_keys.indexOf(role) === -1) {
      available.push({ name: acl.roles[role].displayName, _id: role });     
    }
  })

  // Make the arrays available to calling method
  this.roles = available;
  this.memberships = assigned;

  return cb();
}