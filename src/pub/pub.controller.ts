import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, UseGuards } from '@nestjs/common';
import { PubService } from './pub.service';
import { CreatePubDto } from './dto/create-pub.dto';
import { UpdatePubDto } from './dto/update-pub.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { AnyAuthGuard } from 'src/auth/any-auth.guard';
import { MinioService } from '../minio/minio.service';

@Controller('pub')
@UseGuards(AnyAuthGuard)
export class PubController {
  constructor(private readonly pubService: PubService, private readonly minioService: MinioService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async create(@UploadedFile( new ParseFilePipe({
    validators: [
      new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB max
    ]
  })) file: Express.Multer.File,@Body() createPubDto: CreatePubDto) {
    const fileName = await this.minioService.uploadFile(file, 'pubs');
    createPubDto.image = fileName;
    return this.pubService.create(createPubDto);
  }

  @Get()
  findAll() {
    return this.pubService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pubService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('image'))
  async update(@UploadedFile( new ParseFilePipe({
    validators: [
      new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB max
    ]
  })) file: Express.Multer.File,@Param('id') id: string, @Body() updatePubDto: UpdatePubDto) {
    const fileName = await this.minioService.uploadFile(file, 'pubs');
    updatePubDto.image = fileName;
    const prevpub = await this.pubService.update(id, updatePubDto);
    if (prevpub && prevpub.image) {
      await this.minioService.deleteFile(prevpub.image);
    }
    return prevpub;
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const deletedPub = await this.pubService.remove(id);
    if (deletedPub && deletedPub.image) {
      await this.minioService.deleteFile(deletedPub.image);
    }
    return deletedPub;
  }
}
