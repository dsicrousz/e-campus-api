import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import { InjectMinio } from 'nestjs-minio';
import { Client } from 'minio';

@Injectable()
export class MinioService implements OnModuleInit {
  private bucketName = 'ecampus-uploads';

  constructor(@InjectMinio() private readonly minioClient: Client) {}

  async onModuleInit() {
    try {
      const exists = await this.minioClient.bucketExists(this.bucketName);
      if (!exists) {
        await this.minioClient.makeBucket(this.bucketName);
      }
    } catch (error) {
      console.error('Error initializing MinIO bucket:', error);
    }
  }

  async uploadFile(file: Express.Multer.File, folder: string): Promise<string> {
    const fileName = `${folder}/${Date.now()}-${file.originalname}`;
    await this.minioClient.putObject(
      this.bucketName,
      fileName,
      file.buffer,
      file.size,
      {
        'Content-Type': file.mimetype,
      },
    );
    return fileName;
  }

  async deleteFile(fileName: string): Promise<void> {
    await this.minioClient.removeObject(this.bucketName, fileName);
  }

  async getFileUrl(fileName: string): Promise<string> {
    return await this.minioClient.presignedGetObject(this.bucketName, fileName, 24 * 60 * 60);
  }

  async getFileStream(fileName: string): Promise<NodeJS.ReadableStream> {
    return await this.minioClient.getObject(this.bucketName, fileName);
  }
}
