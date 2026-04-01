import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Dish, DishDocument } from './entities/dish.entity';
import { CreateDishDto } from './dto/create-dish.dto';
import { UpdateDishDto } from './dto/update-dish.dto'
@Injectable()
export class DishService {
  constructor(
    @InjectModel(Dish.name,'ecampus') private readonly dishModel: Model<DishDocument>,
  ) {}

  async create(createDishDto: CreateDishDto): Promise<Dish> {
    const createdDish = new this.dishModel(createDishDto);
    return createdDish.save();
  }

  async findAll(): Promise<Dish[]> {
    return this.dishModel.find();
  }

  async findByRestaurant(restaurantId: string,ticketId?: string): Promise<Dish[]> {
    const match = { service: new Types.ObjectId(restaurantId) } as any;
    if (ticketId) {
      match.ticket = new Types.ObjectId(ticketId);
    }
    return this.dishModel
      .find(match);
  }

  async findOne(id: string): Promise<Dish> {
    const dish = await this.dishModel.findById(id);
    if (!dish) {
      throw new NotFoundException(`Dish with ID ${id} not found`);
    }
    return dish;
  }

  async update(id: string, updateDishDto: UpdateDishDto): Promise<Dish> {
    const updatedDish = await this.dishModel
      .findByIdAndUpdate(id, updateDishDto, { new: true })
    if (!updatedDish) {
      throw new NotFoundException(`Dish with ID ${id} not found`);
    }
    return updatedDish;
  }

  async remove(id: string): Promise<void> {
    const result = await this.dishModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException(`Dish with ID ${id} not found`);
    }
  }
}
