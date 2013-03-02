module.exports = function (compound, Membership) {
  Membership.belongsTo(compound.models.Role, { as: 'role', foreignKey: 'roleId' });
  Membership.belongsTo(compound.models.User, { as: 'user', foreignKey: 'userId' });
}