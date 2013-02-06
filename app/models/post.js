module.exports = function(compound, Post) {
	Post.hasMany(compound.models.Comment, {as: 'comments',  foreignKey: 'postId'});
	Post.belongsTo(compound.models.User, {as: 'author', foreignKey: 'userId'});
}
