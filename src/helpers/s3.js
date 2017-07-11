const s3 = require('s3');
const AWS = require('aws-sdk');

/**
 * Upload dir to S3
 * @param {string} prefix - prefix of the path in the S3 bucket
 * @param {object} credentials - AWS credentials
 * @param {string} bucket - S3 bucket name
 * @param {string} dirPath - source dir path
 * @param {function} getClient - optional, passed function will be invoke with S3 client as param
 */
function upload(prefix, credentials, bucket, dirPath, getClient){
  return new Promise((resolve, reject) => {
    const client = getS3Client(credentials);
    const uploader = client.uploadDir({
      localDir: dirPath,
      deleteRemoved: false,
      s3Params: {
        Bucket: bucket,
        Prefix: prefix,
        CacheControl: 'max-age=2000000,public',
        Expires: '2025-12-31T00:00:00Z'
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
 * @param {string} prefix - prefix of the path in the S3 bucket
 * @param {object} credentials - AWS credentials
 * @param {string} bucket - S3 bucket name
 * @param {string} dirPath - destination dir path
 * @param {function} getClient - optional, passed function will be invoke with S3 client as param
 */
function download(prefix, credentials, bucket, dirPath, getClient){
  return new Promise((resolve, reject) => {
    const client = getS3Client(credentials);
    const uploader = client.downloadDir({
      localDir: dirPath,
      deleteRemoved: true,
      s3Params: {
        Bucket: bucket,
        Prefix: prefix
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

  if(!credentials.accessKeyId || !credentials.secretAccessKey || !credentials.region){
    throw new Error('Cannot get S3 client. Not valid format of credentials object.');
  }

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
