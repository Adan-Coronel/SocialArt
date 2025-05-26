const User = require('./userModel');
const Album = require('./albumModel');
const Image = require('./imageModel');
const Comment = require('./commentModel');
const FriendRequest = require('./friendRequestModel');
const Notification = require('./notificationModel');
const Tag = require('./tagModel');
const ImageTag = require('./imageTagModel');

//Relationshops
// Usuario → Álbumes
User.hasMany(Album, { foreignKey: 'user_id', as: 'albums'});
Album.belongsTo(User, { foreignKey: 'user_id', as: 'propietario' });

// Álbum → Imágenes
Album.hasMany(Image, { foreignKey: 'album_id' });
Image.belongsTo(Album, { foreignKey: 'album_id' });

// Imagen → Comentarios
Image.hasMany(Comment, { foreignKey: 'image_id' });
Comment.belongsTo(Image, { foreignKey: 'image_id' });

// Usuario → Comentarios
User.hasMany(Comment, { foreignKey: 'user_id' });
Comment.belongsTo(User, { foreignKey: 'user_id' });

// Usuario → Notificaciones
User.hasMany(Notification, { foreignKey: 'user_id' });
Notification.belongsTo(User, { foreignKey: 'user_id' });

// Usuario → FriendRequests (dos roles)
User.hasMany(FriendRequest, { foreignKey: 'from_user', as: 'enviadas' });
User.hasMany(FriendRequest, { foreignKey: 'to_user', as: 'recibidas' });
FriendRequest.belongsTo(User, { foreignKey: 'from_user', as: 'emisor' });
FriendRequest.belongsTo(User, { foreignKey: 'to_user', as: 'receptor' });

// Imagen → Tag (muchos a muchos)
Image.belongsToMany(Tag, { through: ImageTag, foreignKey: 'image_id', otherKey: 'tag_id' });
Tag.belongsToMany(Image, { through: ImageTag, foreignKey: 'tag_id', otherKey: 'image_id' });

module.exports = {
  User,
  Album,
  Image,
  Comment,
  FriendRequest,
  Notification,
  Tag,
  ImageTag
};
