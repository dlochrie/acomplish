load('application');

before(use('checkRole'));
//before(loadMember, {only: ['show', 'edit', 'update', 'destroy']});
before(loadAllMembers,{only: ['index']})

action(function index() {
  this.title = 'Manage Users';
  this.members.forEach(function(member) {
   // console.log(member);
  })
  render({
    usersList: this.members
  });
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
  this.members = [];
  return User.all(function(err, users) {
    if (err || !users) {
      next();
    } else {
      users.forEach(function(user) {
        this.members.push(user.getRole())
      })
      next();
    }
  }.bind(this));
}