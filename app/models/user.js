module.exports = function (compound, User) {
	User.hasMany(compound.models.Post, { as: 'posts',  foreignKey: 'userId' });
	User.hasMany(compound.models.Comment, { as: 'comments',  foreignKey: 'userId' });
	User.hasMany(compound.models.Membership, { as: 'memberships',  foreignKey: 'userId' });
	
	/*
	User.prototype.getRole = function getRole() {
	  return Role.findOne({ where: { id: this.roleId }}, function(err, role) {
	    return role.name;
	  });
	}
	*/
	
	/**
	 * TODO: This should handle MORE than Google
	 */ 
	User.findOrCreate = function findOrCreate(data, done) {
		User.all({
			where: {
				googleId: data.openId
			}, limit: 1
		}, function (err, user) {
				if (user[0]) return done(err, user[0]);
				User.create({
					displayName: data.profile.displayName,
					email: data.profile.emails[0].value,
					googleId: data.openId
				}, done);
		});
	}
	
	User.find = function find(id, done) {
		User.all({
			where: {
				id: id
			}, limit: 1
		}, function (err, user) {
			if (user[0]) return done(err, user[0]);
			done;
		});
	}
}

