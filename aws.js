require("dotenv").config()
const AWS = require('aws-sdk');


AWS.config.update({
    accessKeyId: process.env.ACCESSKEY, 
    secretAccessKey: process.env.SECRETKEY, 
    region: process.env.REGION, 
  });

  

const s3 = new AWS.S3();







const uploadS3Object=async(file)=>{
    try {
        const fileKey=`${Date.now()}_${file.originalname}`
        const uploadParams = {
            Bucket:process.env.S3_Bucket, 
            Key: fileKey, 
            Body: file.buffer, 
            ContentType: file.mimetype,
          };
      
         
          const data = await s3.upload(uploadParams).promise();
          return [data.Location,fileKey]
    } catch (error) {
        console.log(error)
    }
}

const deleteFileFromS3 = async ( fileKey) => {
    const params = {
      Bucket: process.env.S3_Bucket,
      Key: fileKey 
    };
  
    try {
      const data = await s3.deleteObject(params).promise();
      console.log('File deleted successfully', data);
    } catch (err) {
      console.error('Error deleting file', err);
    }
  };
  
  

  
module.exports={deleteFileFromS3,uploadS3Object}

