import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { Service, ServiceDocument } from './entities/service.entity';
import { User, UserDocument } from 'src/user/entities/user.entity';

@Injectable()
export class ServiceService {
  constructor(@InjectModel(Service.name,'ecampus') private ServiceModel: Model<ServiceDocument>,
  @InjectModel(User.name,'users') private userModel: Model<UserDocument>
){}


  async create(createServiceDto: CreateServiceDto):Promise<Service> {
    try {
      const creadtedService = new this.ServiceModel(createServiceDto);
      return await creadtedService.save();
    } catch (error) {
      throw new HttpException(error.message, 500);
    }
  }

  async findAll(): Promise<Service[]> {
  try {
    return await this.ServiceModel.find().populate('gerant','',this.userModel);
  } catch (error) {
    throw new HttpException(error.message, 500);
  }
  }

  async getByType(type:string) {
    try {
      return this.ServiceModel.find({typeService:type}).populate('gerant','',this.userModel);
    } catch (error) {
      throw new HttpException(error.message, 500);
    }
  }

  async getByAgentControle(agentControleId: string): Promise<Service[]> {
    try {
      return await this.ServiceModel.find({agentsControle: {$in: [agentControleId]},active:true});
    } catch (error) {
      throw new HttpException(error.message, 500);
    }
  }

  async getByGerant(gerantId: string): Promise<Service[]> {
    try {
      return await this.ServiceModel.find({gerant: gerantId});
    } catch (error) {
      throw new HttpException(error.message, 500);
    }
  }

  async findActive(): Promise<Service[]> {
    try {
      return await this.ServiceModel.find({active:true}).populate('gerant','',this.userModel);
    } catch (error) {
      throw new HttpException(error.message, 500);
    }
    }

  async findOne(id: string): Promise<Service> {
    try {
      return await this.ServiceModel.findById(id).populate('gerant agentsControle','',this.userModel);
    } catch (error) {
      throw new HttpException(error.message, 500);
    }
  }

  async update(id: string, updateServiceDto: UpdateServiceDto):Promise<Service> {
    try {
      return await this.ServiceModel.findByIdAndUpdate(id, updateServiceDto);
    } catch (error) {
      throw new HttpException(error.message, 500);
    }
  }

  async remove(id: string): Promise<Service> {
    try {
      return await this.ServiceModel.findByIdAndDelete(id);
    } catch (error) {
      throw new HttpException(error.message, 500);
    }
  }
}
