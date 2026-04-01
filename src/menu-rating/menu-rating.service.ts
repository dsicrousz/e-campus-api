import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  MenuDishRating,
  MenuDishRatingDocument,
} from './entities/menu-dish-rating.entity';
import { UpsertMenuDishRatingDto } from './dto/upsert-menu-dish-rating.dto';
import { Menu, MenuDocument } from 'src/menu/entities/menu.entity';

@Injectable()
export class MenuRatingService {
  constructor(
    @InjectModel(MenuDishRating.name, 'ecampus')
    private readonly ratingModel: Model<MenuDishRatingDocument>,
    @InjectModel(Menu.name, 'ecampus')
    private readonly menuModel: Model<MenuDocument>,
  ) {}

  async upsertRating(params: {
    dishId: string;
    compteId: string;
    dto: UpsertMenuDishRatingDto;
  }): Promise<MenuDishRating> {
    const { dishId, compteId, dto } = params

    return this.ratingModel
      .findOneAndUpdate(
        {
          dishId,
          compteId
        },
        {
          $set: {
            rating: dto.rating,
            comment: dto.comment,
          },
        },
        { new: true, upsert: true },
      )
      .exec();
  }

  async getDishRatingSummary(params: {
    dishId: string;
    compteId?: string;
  }): Promise<{ average: number; count: number; myRating?: MenuDishRating | null }> {
    const { dishId, compteId} = params;

    const match = {
      compteIdId: new Types.ObjectId(compteId),
      dishId: new Types.ObjectId(dishId),
    };

    const agg = await this.ratingModel
      .aggregate([
        { $match: match },
        {
          $group: {
            _id: null,
            average: { $avg: '$rating' },
            count: { $sum: 1 },
          },
        },
      ])
      .exec();

    const average = agg?.[0]?.average ? Number(agg[0].average) : 0;
    const count = agg?.[0]?.count ? Number(agg[0].count) : 0;

    return { average, count };
  }
}
