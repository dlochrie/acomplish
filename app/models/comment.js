module.exports = function (compound, Comment) {
	Comment.belongsTo(compound.models.Post, {as: 'post', foreignKey: 'postId'});
	Comment.belongsTo(compound.models.User, {as: 'author', foreignKey: 'userId'});
}
