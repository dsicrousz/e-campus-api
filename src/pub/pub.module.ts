import { Module } from '@nestjs/common';
import { PubService } from './pub.service';
import { PubController } from './pub.controller';
import { MulterModule } from '@nestjs/platform-express';
import { MongooseModule } from '@nestjs/mongoose';
import { Pub, PubSchema } from './entities/pub.entity';
import { diskStorage } from 'multer';
import { AuthModule } from 'src/auth/auth.module';
import { S3StorageEngine, StorageService } from 'src/storage';

@Module({
  imports: [
    MongooseModule.forFeature([{name: Pub.name, schema: PubSchema}],'ecampus'),
  MulterModule.registerAsync({
            useFactory: (storageService: StorageService) => ({
                storage: storageService.isEnabled()
                    ? new S3StorageEngine(storageService, { prefix: 'pubs' })
                    : diskStorage({
                        destination: './uploads/pubs',
                        filename: (_req, file, cb) => {
                            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                            const ext = file.originalname.split('.').pop() ?? 'bin';
                            cb(null, `${uniqueSuffix}.${ext}`);
                        },
                    }),
                fileFilter: (_req: any, file: any, cb: any) => {
                    const allowedMimes = [
                        'application/pdf',
                        'image/jpeg',
                        'image/png',
                        'image/gif',
                        'application/msword',
                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                        'application/vnd.ms-excel',
                        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    ];
                    if (allowedMimes.includes(file.mimetype)) {
                        cb(null, true);
                    } else {
                        cb(new Error('Type de fichier non autorisé'), false);
                    }
                },
                limits: {
                    fileSize: 10 * 1024 * 1024, // 10 MB max
                },
            }),
            inject: [StorageService],
        }),
    AuthModule
  ],
  controllers: [PubController],
  providers: [PubService]
})
export class PubModule {}
