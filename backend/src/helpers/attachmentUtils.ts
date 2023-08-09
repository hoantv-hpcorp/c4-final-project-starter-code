import * as AWS from 'aws-sdk'
// import * as AWSXRay from 'aws-xray-sdk'

const s3 = new AWS.S3({
  signatureVersion: 'v4',
  region: 'us-east-1',
  params: {Bucket: process.env.ATTACHMENT_S3_BUCKET}
});
const bucketName = process.env.ATTACHMENT_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

// TODO: Implement the fileStogare logic
export function generatePreUrl(todoId: string) {
  return s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: todoId,
    Expires: Number(urlExpiration)
  })
}