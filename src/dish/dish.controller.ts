import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  UseGuards,
} from '@nestjs/common';
import { DishService } from './dish.service';
import { CreateDishDto } from './dto/create-dish.dto';
import { UpdateDishDto } from './dto/update-dish.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { BetterAuthGuard } from 'src/auth/better-auth.guard';
import { MinioService } from '../minio/minio.service';

@Controller('dishes')
@UseGuards(BetterAuthGuard)
export class DishController {
  constructor(private readonly dishService: DishService, private readonly minioService: MinioService) {}

  @Post()
  create(@Body() createDishDto: CreateDishDto) {
    return this.dishService.create(createDishDto);
  }

  @Get()
  findAll() {
    return this.dishService.findAll();
  }

  @Get('restaurant/:restaurantId')
  findByRestaurant(@Param('restaurantId') restaurantId: string, @Query('ticketId') ticketId?: string) {
    return this.dishService.findByRestaurant(restaurantId,ticketId);
  }


  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dishService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDishDto: UpdateDishDto) {
    return this.dishService.update(id, updateDishDto);
  }

  @Patch('updateimage/:id')
  @UseInterceptors(FileInterceptor('file'))
  async updateImage(@Param('id') id: string, @UploadedFile(new ParseFilePipe({
    validators: [
      new MaxFileSizeValidator({ maxSize: 1000000 }),
    ],
  }),) file: Express.Multer.File) {
    const fileName = await this.minioService.uploadFile(file, 'plats');
    return this.dishService.update(id,{image:fileName});
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dishService.remove(id);
  }
}
