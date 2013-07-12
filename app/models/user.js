module.exports = function (compound, User) {
  // Describe Relations
  User.hasMany(compound.models.Post, {as: 'posts', foreignKey: 'userId'});
  User.hasMany(compound.models.Comment, {as: 'comments', foreignKey: 'userId'});
  User.hasMany(compound.models.Membership, 
      {as: 'memberships', foreignKey: 'userId'});
  

  // Describe Validations
  User.validatesPresenceOf(['email', 'displayName', 'password'], 
      {message: 'field cannot be blank'});
  User.validatesLengthOf('password', 
      {min:6, message: {min: 'is too short'}});
  User.validatesUniquenessOf('displayName', {message: 'is not unique'});
  User.validatesUniquenessOf('email', {message: 'is not unique'});


  /**
   * Find a `google` user, using Google PassportJS Auth Strategy
   *
   * @param {Object} data Object containing user details.
   * @param {Function} done Callback method.
   */
  User.findOrCreateGoogle = function(data, done) {
    User.all({where: {googleId: data.openId}, limit: 1}, 
    function (err, user) {
      if (user[0]) return done(err, user[0]);
      User.create({
        displayName: data.profile.displayName,
        email: data.profile.emails[0].value,
        googleId: data.openId
      }, done);
    });
  }
  
  /**
   * Find a `local` user, using Local PassportJS Auth Strategy
   *
   * @param {Object} data Object containing user details.
   * @param {Function} done Callback method.
   */
  User.findLocal = function(data, done) {
   User.all({where: {email: data.email, password: data.password}, limit: 1},
    function(err, user) {
      console.log('err', err)
      console.log('user', user)
      if (user[0]) {
        return done(err, user[0]);
      } else {
        //return done(null, false);
        return done(err);
      }
    }); 
  }

  User.find = function find(id, done) {
    User.all({where: {id: id}, limit: 1}, 
    function (err, user) {
      if (user[0]) return done(err, user[0]);
      done;
    });
  }
}