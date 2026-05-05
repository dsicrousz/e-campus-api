import { Module } from '@nestjs/common';
import { PubService } from './pub.service';
import { PubController } from './pub.controller';
import { MulterModule } from '@nestjs/platform-express';
import { MongooseModule } from '@nestjs/mongoose';
import { Pub, PubSchema } from './entities/pub.entity';
import { AuthModule } from 'src/auth/auth.module';
import { MinioModule } from '../minio/minio.module';
import { memoryStorage } from 'multer';

@Module({
  imports: [
    MongooseModule.forFeature([{name: Pub.name, schema: PubSchema}],'ecampus'),
    MulterModule.register({
      storage: memoryStorage(),
    }),
    AuthModule,
    MinioModule
  ],
  controllers: [PubController],
  providers: [PubService]
})
export class PubModule {}
