load('application');

before(use('requireAdmin'));

before(loadRole, {
	only: ['show', 'edit', 'update', 'destroy']
});

action('new', function () {
	this.title = 'New role';
	this.role = new Role;
	render();
});

action(function create() {
	Role.create(req.body.Role, function (err, role) {
		respondTo(function (format) {
			format.json(function () {
				if (err) {
					send({
						code: 500,
						error: role && role.errors || err
					});
				} else {
					send({
						code: 200,
						data: role.toObject()
					});
				}
			});
			format.html(function () {
				if (err) {
					flash('error', 'Role can not be created');
					render('new', {
						role: role,
						title: 'New role'
					});
				} else {
					flash('info', 'Role created');
					redirect(path_to.admin_roles);
				}
			});
		});
	});
});

action(function index() {
	this.title = 'Roles index';
	Role.all(function (err, roles) {
		switch (params.format) {
			case "json":
				send({
					code: 200,
					data: roles
				});
				break;
			default:
				render({
					roles: roles
				});
		}
	});
});

action(function show() {
	this.title = 'Role show';
	switch (params.format) {
		case "json":
			send({
				code: 200,
				data: this.role
			});
			break;
		default:
			render();
	}
});

action(function edit() {
	this.title = 'Role edit';
	switch (params.format) {
		case "json":
			send(this.role);
			break;
		default:
			render();
	}
});

action(function update() {
	var role = this.role;
	this.title = 'Edit role details';
	this.role.updateAttributes(body.Role, function (err) {
		respondTo(function (format) {
			format.json(function () {
				if (err) {
					send({
						code: 500,
						error: role && role.errors || err
					});
				} else {
					send({
						code: 200,
						data: role
					});
				}
			});
			format.html(function () {
				if (!err) {
					flash('info', 'Role updated');
					redirect(path_to.admin_role(role));
				} else {
					flash('error', 'Role can not be updated');
					render('edit');
				}
			});
		});
	});
});

action(function destroy() {
	this.role.destroy(function (error) {
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
					flash('error', 'Can not destroy role');
				} else {
					flash('info', 'Role successfully removed');
				}
				send("'" + path_to.admin_roles + "'");
			});
		});
	});
});

function loadRole() {
	Role.find(params.id, function (err, role) {
		if (err || !role) {
			if (!err && !role && params.format === 'json') {
				return send({
					code: 404,
					error: 'Not found'
				});
			}
			redirect(path_to.admin_roles);
		} else {
			this.role = role;
			next();
		}
	}.bind(this));
}