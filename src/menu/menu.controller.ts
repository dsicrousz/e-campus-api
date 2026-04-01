import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MenuService } from './menu.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { BetterAuthGuard } from 'src/auth/better-auth.guard';
import { AnyAuthGuard } from 'src/auth/any-auth.guard';

@Controller('menus')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Post()
  @UseGuards(BetterAuthGuard)
  create(@Body() createMenuDto: CreateMenuDto) {
    return this.menuService.create(createMenuDto);
  }

  @Get()
  @UseGuards(BetterAuthGuard)
  findAll() {
    return this.menuService.findAll();
  }

  @Get('restaurant/:restaurantId')
  @UseGuards(BetterAuthGuard)
  getMenuByRestaurant(@Param('restaurantId') restaurantId: string) {
    return this.menuService.getMenuByRestaurant(restaurantId);
  }

  @Get('day/:restaurantId')
  @UseGuards(AnyAuthGuard)
  findByDay(@Param('restaurantId') restaurantId: string) {
    return this.menuService.findByDay(restaurantId);
  }

  @Get(':id')
  @UseGuards(AnyAuthGuard)
  findOne(@Param('id') id: string) {
    return this.menuService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(BetterAuthGuard)
  update(@Param('id') id: string, @Body() updateMenuDto: UpdateMenuDto) {
    return this.menuService.update(id, updateMenuDto);
  }

  @Delete(':id')
  @UseGuards(BetterAuthGuard)
  remove(@Param('id') id: string) {
    return this.menuService.remove(id);
  }
}
