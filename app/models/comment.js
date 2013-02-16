module.exports = function (compound, Comment) {
	Comment.belongsTo(compound.models.User, { as: 'author', foreignKey: 'userId' })
};