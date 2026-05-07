import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator, UseGuards } from '@nestjs/common';
import { PubService } from './pub.service';
import { CreatePubDto } from './dto/create-pub.dto';
import { UpdatePubDto } from './dto/update-pub.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { existsSync, unlinkSync } from 'fs';
import { AnyAuthGuard } from 'src/auth/any-auth.guard';
import { StorageService } from 'src/storage';

@Controller('pub')
@UseGuards(AnyAuthGuard)
export class PubController {
  constructor(
    private readonly pubService: PubService,
    private readonly storageService: StorageService,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  create(@UploadedFile( new ParseFilePipe({
    validators: [
      new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB max
    ]
  })) file: Express.Multer.File,@Body() createPubDto: CreatePubDto) {
    createPubDto.image = file.path;
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
    updatePubDto.image = file.path;
    const prevpub =  await this.pubService.update(id, updatePubDto);
    if (prevpub?.image) {
      await this.deleteFile(prevpub.image);
    }

    return prevpub;
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const deletedPub = await this.pubService.remove(id);
    if (deletedPub?.image) {
      await this.deleteFile(deletedPub.image);
    }
    return deletedPub;
  }

  private async deleteFile(imagePath: string): Promise<void> {
    if (this.storageService.isEnabled()) {
      const key = this.storageService.extractKeyFromUrl(imagePath);
      if (key && await this.storageService.exists(key)) {
        await this.storageService.delete(key);
      }
    } else {
      const localPath = `uploads/pubs/${imagePath}`;
      if (existsSync(localPath)) {
        unlinkSync(localPath);
      }
    }
  }
}
