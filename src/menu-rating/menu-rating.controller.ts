import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AnyAuthGuard } from 'src/auth/any-auth.guard';
import { MenuRatingService } from './menu-rating.service';
import { UpsertMenuDishRatingDto } from './dto/upsert-menu-dish-rating.dto';

@Controller('menus')
@UseGuards(AnyAuthGuard)
export class MenuRatingController {
  constructor(private readonly menuRatingService: MenuRatingService) {}

  @Post('plats/:compteId/:dishId/ratings')
  upsertDishRating(
    @Param('compteId') compteId: string,
    @Param('dishId') dishId: string,
    @Body() dto: UpsertMenuDishRatingDto,
  ) {

    return this.menuRatingService.upsertRating({
      dishId,
      compteId,
      dto,
    });
  }

  @Get('plats/compteId/:dishId/ratings/summary')
  getDishRatingSummary(
    @Param('compteId') compteId: string,
    @Param('dishId') dishId: string,
    @Req() req: Request,
  ) {
    return this.menuRatingService.getDishRatingSummary({
      dishId,
      compteId,
    });
  }
}
