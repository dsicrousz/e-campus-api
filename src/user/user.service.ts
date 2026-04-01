import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name,'users') private userModel: Model<UserDocument>) {}

  async findAll(): Promise<User[]> {
    try {
      return await this.userModel.find();
    } catch (error) {
      throw new HttpException(error.message, 500);
    }
  }

  async findByRole(r: string): Promise<User[]> {
    try {
      const users = await this.userModel.find();
      return users.filter(user => user.role.includes(r));
    } catch (error) {
      throw new HttpException(error.message, 500);
    }
  }

  async findOne(id: string): Promise<User> {
    try {
      return await this.userModel.findById(id,{password:0});
    } catch (error) {
      throw new HttpException(error.message, 500);
    }
  }
}
