const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: 'dxxxuaxj1',
  api_key: '998334356587468',
  api_secret: 'XoXWk3ONH_9FSAARxPxmxikzN9Y'
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'socialart',
    allowed_formats: ['jpg', 'png', 'jpeg'],
    transformation: [{ width: 1000, height: 1000, crop: "limit" }]
  }
});

module.exports = { cloudinary, storage };
