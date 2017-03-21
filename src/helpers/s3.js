const s3 = require('s3');
const AWS = require('aws-sdk');

/**
 * Upload dir to S3
 * @param {object} credentials - AWS credentials
 * @param {string} bucket - S3 bucket name
 * @param {string} dirPath - source dir path
 */
function upload({ credentials, bucket, dirPath }){
  return new Promise((resolve, reject) => {
    const client = getClient(credentials);
    const uploader = client.uploadDir({
      localDir: dirPath,
      deleteRemoved: true,
      s3Params: {
        Bucket: bucket,
        Prefix: ''
      }
    });
    uploader
      .on('err', reject)
      .on('end', resolve);
  });
}

/**
 * Download dir from S3
 * @param {object} credentials - AWS credentials
 * @param {string} bucket - S3 bucket name
 * @param {string} dirPath - destination dir path
 */
function download({ credentials, bucket, dirPath }){
  return new Promise((resolve, reject) => {
    const client = getClient(credentials);
    const uploader = client.downloadDir({
      localDir: dirPath,
      deleteRemoved: true,
      s3Params: {
        Bucket: bucket,
        Prefix: ''
      }
    });
    uploader
      .on('err', reject)
      .on('end', resolve);
  });
}

/**
 * Return S3 client
 * @param {object} credentials - AWS credentials, format:
 * {
 *  accessKeyId: {{ID}},
 *  secretAccessKey: {{SECRET}},
 *  region: 'us-west-2'
 * }
 */
function getClient(credentials){
  const awsS3Client = new AWS.S3(credentials);
  const client = s3.createClient({
    s3Client: awsS3Client
  });
  return client;
}

module.exports = {
  upload,
  download
};
