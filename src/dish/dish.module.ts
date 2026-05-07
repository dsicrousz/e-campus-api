import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Dish, DishSchema } from './entities/dish.entity';
import { DishController } from './dish.controller';
import { DishService } from './dish.service';
import { MulterModule } from '@nestjs/platform-express';
import { AuthModule } from 'src/auth/auth.module';
import { diskStorage } from 'multer';
import { S3StorageEngine, StorageService } from 'src/storage';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([{ name: Dish.name, useFactory: () => {
      const schema = DishSchema;
      schema.plugin(require('mongoose-autopopulate'));
      return schema;
    } }], 'ecampus'),
    MulterModule.registerAsync({
      useFactory: (storageService: StorageService) => ({
        storage: storageService.isEnabled()
          ? new S3StorageEngine(storageService, { prefix: 'dishes' })
          : diskStorage({
              destination: './uploads/plats',
              filename: (_req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                const ext = file.originalname.split('.').pop() ?? 'bin';
                cb(null, `${uniqueSuffix}.${ext}`);
              },
            }),
        fileFilter: (_req: any, file: any, cb: any) => {
          const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
          if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
          } else {
            cb(new Error('Type de fichier non autorisé'), false);
          }
        },
        limits: {
          fileSize: 1 * 1024 * 1024, // 1 MB max
        },
      }),
      inject: [StorageService],
    }),
    AuthModule,
  ],
  controllers: [DishController],
  providers: [DishService],
  exports: [DishService],
})
export class DishModule {}
