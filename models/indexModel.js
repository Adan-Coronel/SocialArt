const User = require('./userModel');
const Album = require('./albumModel');
const Image = require('./imageModel');
const Comment = require('./commentModel');
const FriendRequest = require('./friendRequestModel');
const Notification = require('./notificationModel');
const Tag = require('./tagModel');
const ImageTag = require('./imageTagModel');
const ImageVisibility = require("./imageVisibilityModel");
const SharedAlbum = require("./sharedAlbumModel");
const Reaction = require("./reactionModel")

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
/*User.hasMany(Notification, { foreignKey: 'user_id' });
Notification.belongsTo(User, { foreignKey: 'user_id' });
*/
// Usuario → Notificaciones (receptor)
User.hasMany(Notification, { foreignKey: 'user_id', as: 'notificacionesRecibidas' });
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'receptor' });

// Usuario → Notificaciones (emisor)
User.hasMany(Notification, { foreignKey: 'from_user_id', as: 'notificacionesEnviadas' });
Notification.belongsTo(User, { foreignKey: 'from_user_id', as: 'emisor' });
// Usuario → FriendRequests (dos roles)
User.hasMany(FriendRequest, { foreignKey: 'from_user', as: 'enviadas' });
User.hasMany(FriendRequest, { foreignKey: 'to_user', as: 'recibidas' });
FriendRequest.belongsTo(User, { foreignKey: 'from_user', as: 'emisor' });
FriendRequest.belongsTo(User, { foreignKey: 'to_user', as: 'receptor' });


Image.hasMany(ImageVisibility, { foreignKey: "image_id", as: "visibilidad" })
ImageVisibility.belongsTo(Image, { foreignKey: "image_id" })
User.hasMany(ImageVisibility, { foreignKey: "user_id" })
ImageVisibility.belongsTo(User, { foreignKey: "user_id" })


User.hasMany(SharedAlbum, { foreignKey: "owner_id", as: "albumesCompartidos" })
User.hasMany(SharedAlbum, { foreignKey: "viewer_id", as: "albumesRecibidos" })

SharedAlbum.belongsTo(User, { foreignKey: "owner_id", as: "propietario" })
SharedAlbum.belongsTo(User, { foreignKey: "viewer_id", as: "visualizador" })
SharedAlbum.belongsTo(Album, { foreignKey: "album_id" })
Album.hasMany(SharedAlbum, { foreignKey: "album_id" })


Album.belongsToMany(Tag, { through: "album_tags", foreignKey: "album_id", otherKey: "tag_id" })
Tag.belongsToMany(Album, { through: "album_tags", foreignKey: "tag_id", otherKey: "album_id" })


User.hasMany(Reaction, { foreignKey: "user_id" })
Reaction.belongsTo(User, { foreignKey: "user_id" })
Image.hasMany(Reaction, { foreignKey: "image_id" })
Reaction.belongsTo(Image, { foreignKey: "image_id" })



module.exports = {
  User,
  Album,
  Image,
  Comment,
  FriendRequest,
  Notification,
  Tag,
  ImageTag,
  ImageVisibility,
  SharedAlbum,
  Reaction
};
