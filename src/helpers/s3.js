const s3 = require('s3');
const AWS = require('aws-sdk');

/**
 * Upload dir to S3
 * @param {object} credentials - AWS credentials
 * @param {string} bucket - S3 bucket name
 * @param {string} dirPath - source dir path
 */
function upload(credentials, bucket, dirPath, getClient){
  return new Promise((resolve, reject) => {
    const client = getS3Client(credentials);
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
    if(typeof getClient === 'function'){
      getClient(uploader);
    }
  });
}

/**
 * Download dir from S3
 * @param {object} credentials - AWS credentials
 * @param {string} bucket - S3 bucket name
 * @param {string} dirPath - destination dir path
 */
function download(credentials, bucket, dirPath, getClient){
  return new Promise((resolve, reject) => {
    const client = getS3Client(credentials);
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
    if(typeof getClient === 'function'){
      getClient(uploader);
    }
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
function getS3Client(credentials){
  const awsS3Client = new AWS.S3(credentials);
  const client = s3.createClient({
    s3Client: awsS3Client
  });

  // https://github.com/andrewrk/node-s3-client/issues/149
  client.s3.addExpect100Continue = () => {};

  return client;
}

module.exports = {
  upload,
  download
};
