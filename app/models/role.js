module.exports = function (compound, Role) {
	Role.hasMany(compound.models.Membership, { as: 'memberships', foreignKey: 'roleId' });
};