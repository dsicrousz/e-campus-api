import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator, UseGuards } from '@nestjs/common';
import { PubService } from './pub.service';
import { CreatePubDto } from './dto/create-pub.dto';
import { UpdatePubDto } from './dto/update-pub.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { existsSync, unlinkSync } from 'fs';
import { BetterAuthGuard } from 'src/auth/better-auth.guard';

@Controller('pub')
@UseGuards(BetterAuthGuard)
export class PubController {
  constructor(private readonly pubService: PubService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  create(@UploadedFile( new ParseFilePipe({
    validators: [
      new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB max
      new FileTypeValidator({ fileType: 'jpeg|png|jpg' }),
    ]
  })) file: Express.Multer.File,@Body() createPubDto: CreatePubDto) {
    createPubDto.image = file.filename;
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
      new FileTypeValidator({ fileType: 'jpeg|png|jpg' }),
    ]
  })) file: Express.Multer.File,@Param('id') id: string, @Body() updatePubDto: UpdatePubDto) {
    updatePubDto.image = file.filename;
    const prevpub =  await this.pubService.update(id, updatePubDto);
    if(prevpub && existsSync(`uploads/pubs/${prevpub.image}`))
    unlinkSync(`uploads/pubs/${prevpub.image}`);

    return prevpub;
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const deletedPub = await this.pubService.remove(id);
    if(deletedPub && existsSync(`uploads/pubs/${deletedPub.image}`))
    unlinkSync(`uploads/pubs/${deletedPub.image}`);
    return deletedPub;
  }
}
