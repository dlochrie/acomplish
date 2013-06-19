module.exports = function (compound, Post) {
  Post.belongsTo(compound.models.User, {as: 'author', foreignKey: 'userId'});
  Post.hasMany(compound.models.Comment, {as: 'comments', foreignKey: 'postId'});
};
