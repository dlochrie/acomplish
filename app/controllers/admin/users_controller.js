load('application');

before(use('checkRole'));
//before(loadMember, {only: ['show', 'edit', 'update', 'destroy']});
before(loadAllMembers,{only: ['index']})

action(function index() {
  this.title = 'Manage Users';
  User.all(function (err, users) {
    render({ registered: users });
  })
});

action(function show() {
  this.title = 'User Management';
  Role.findOne({ where: { id: this.member.roleId }}, function(err, role) {
    render({ role: role });
  });  
});

action(function edit() {
  this.title = 'Edit User';
  Role.all(function(err, roles) {
    render({ roles: roles });
  });      
});

action(function update() {
  req.body.User.updated_at = new Date;
  body.User.updated_at = new Date;
  this.member.updateAttributes(body.User, function (err) {
    if (!err) {
      flash('info', 'User Updated');
      redirect(path_to.admin_user(this.member));
    } else {
      flash('error', 'User info can not be updated');
      this.title = 'Edit User Details';
      render('edit');
    }
  }.bind(this));
});

action(function destroy() {
  this.user.destroy(function (error) {
    if (error) {
      flash('error', 'Can not destroy user');
    } else {
      flash('info', 'User successfully removed');
    }
    send("'" + path_to.admin_users() + "'");
  });
});

function loadAllMembers() {
  var usersList = [];
  var async = require('async');
  
  async.waterfall([
    function getUsers(callback) {
      User.all(function(err, users) {
        if (err || !users) { callback(err); }
        return callback(null, users);
      });
    },
    function getRoles(users, callback) {
      users.forEach(function(user) {
        user.roleName = getRole(user);
        return usersList.push(user);
      });
      callback(null);
    }
  ], function(err) {
    if (!err) {
      render({ registered: usersList, title: "User Management" })
    }
  });
}

function getRole(user) {
  Role.findOne({ where: { id: user.roleId }}, function(err, role) {
    this.roleName = role.name;
  }.bind(this));
  return this.roleName;
}