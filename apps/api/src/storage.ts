import {
  CreateBucketCommand,
  DeleteObjectsCommand,
  HeadBucketCommand,
  PutBucketPolicyCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';

// SeaweedFS, Amazon S3 ile aynı dili konuşur. Canlıda gerçek S3'e geçmek için
// sadece S3_ENDPOINT değişir.
export const BUCKET = process.env.S3_BUCKET ?? 'ilanlar';

export const s3 = new S3Client({
  endpoint: process.env.S3_ENDPOINT ?? 'http://localhost:8333',
  region: 'us-east-1',
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY ?? 'emlak',
    secretAccessKey: process.env.S3_SECRET_KEY ?? 'emlak',
  },
});

export async function ensureBucket() {
  try {
    await s3.send(new HeadBucketCommand({ Bucket: BUCKET }));
  } catch {
    await s3.send(new CreateBucketCommand({ Bucket: BUCKET }));
    console.log(`Depoda "${BUCKET}" klasörü oluşturuldu.`);
  }
  // Fotoğraflar sitede herkese açık görünsün (sadece okuma).
  try {
    await s3.send(
      new PutBucketPolicyCommand({
        Bucket: BUCKET,
        Policy: JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            { Effect: 'Allow', Principal: '*', Action: ['s3:GetObject'], Resource: [`arn:aws:s3:::${BUCKET}/*`] },
          ],
        }),
      }),
    );
  } catch {
    // Bazı depolar politika desteklemez; geliştirmede zaten herkese açık.
  }
}

export function putObject(key: string, body: Buffer, contentType: string) {
  return s3.send(new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: body, ContentType: contentType }));
}

export async function deleteObjects(keys: (string | null | undefined)[]) {
  const list = keys.filter((k): k is string => !!k);
  if (!list.length) return;
  await s3.send(new DeleteObjectsCommand({ Bucket: BUCKET, Delete: { Objects: list.map((Key) => ({ Key })) } }));
}
