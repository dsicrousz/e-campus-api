import { Module } from '@nestjs/common';
import { ServiceService } from './service.service';
import { ServiceController } from './service.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Service, ServiceSchema } from './entities/service.entity';
import { AuthModule } from 'src/auth/auth.module';
import { User, UserSchema } from 'src/user/entities/user.entity';

@Module({
  imports: [MongooseModule.forFeatureAsync([{name: Service.name, useFactory: () => {
    const schema = ServiceSchema;
   schema.plugin(require('mongoose-autopopulate'));
    return schema;
  }}],'ecampus'),
  MongooseModule.forFeature([{ name: User.name, schema: UserSchema }],'users'),
  AuthModule],
  controllers: [ServiceController],
  providers: [ServiceService],
  exports: [ServiceService]
})
export class ServiceModule {}
