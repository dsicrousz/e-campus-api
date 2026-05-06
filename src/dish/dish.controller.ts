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
  FileTypeValidator,
  UseGuards,
} from '@nestjs/common';
import { DishService } from './dish.service';
import { CreateDishDto } from './dto/create-dish.dto';
import { UpdateDishDto } from './dto/update-dish.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { BetterAuthGuard } from 'src/auth/better-auth.guard';

@Controller('dishes')
@UseGuards(BetterAuthGuard)
export class DishController {
  constructor(private readonly dishService: DishService) {}

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
  @UseInterceptors(FileInterceptor('file',{
    storage: diskStorage({
      destination: (req, file, cb) => {
        cb(null, "uploads/plats");
      },
      filename: (req, file, cb) => {
        const ext = file.originalname.split('.').pop();
        cb(null, `${req.params.id}.${ext}`);
      },
    }),
  }))
  updateImage(@Param('id') id: string, @UploadedFile(new ParseFilePipe({
    validators: [
      new MaxFileSizeValidator({ maxSize: 1000000 }),
      new FileTypeValidator({ fileType: /^(image\/jpeg|image\/png|image\/webp)$/i }),
    ],
  }),) file: Express.Multer.File) {
   return this.dishService.update(id,{image:file.filename});
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dishService.remove(id);
  }
}
