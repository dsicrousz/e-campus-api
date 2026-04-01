import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Menu, MenuDocument } from './entities/menu.entity';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';

@Injectable()
export class MenuService {
  constructor(
    @InjectModel(Menu.name,'ecampus') private readonly menuModel: Model<MenuDocument>,
  ) {}

  async create(createMenuDto: CreateMenuDto): Promise<Menu> {
    // Check if a menu already exists for this day
    const existingMenu = await this.menuModel
      .findOne({ date: createMenuDto.date })
      .exec();
    
    if (existingMenu) {
      throw new ConflictException(
        `Menu already exists for ${createMenuDto.date}`,
      );
    }

    const createdMenu = new this.menuModel(createMenuDto);
    return createdMenu.save();
  }

  async findAll(): Promise<Menu[]> {
    return this.menuModel.find();
  }

  async findByDay(restaurantId: string): Promise<Menu> {
    const date = new Date();
    const menu = await this.menuModel
      .findOne({ service: new Types.ObjectId(restaurantId), date: date.toISOString().split('T')[0] } as any);
    return menu;
  }

  async findOne(id: string): Promise<Menu> {
    const menu = await this.menuModel.findById(id);
    return menu;
  }

  async update(id: string, updateMenuDto: UpdateMenuDto): Promise<Menu> {
  return await this.menuModel.findByIdAndUpdate(id, updateMenuDto, { new: true }); 
  }

  async remove(id: string): Promise<void> {
    return await this.menuModel.findByIdAndDelete(id);
  }

  async getWeeklyMenu(): Promise<Menu[]> {
    return this.menuModel
      .find();
  }


  async getMenuByRestaurant(restaurantId: string): Promise<Menu[]> {
    return this.menuModel
      .find({ service:restaurantId });
  }
}
