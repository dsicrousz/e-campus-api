import { Controller, Get, Param, Res, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import { MinioService } from './minio.service';

@Controller('uploads')
export class MinioController {
  constructor(private readonly minioService: MinioService) {}

  @Get('*path')
  async getFile(@Param('path') path: string, @Res() res: Response) {
    const url = path.split(',').join('/');
    try {
      const stream = await this.minioService.getFileStream(url);
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      res.setHeader('Access-Control-Allow-Origin', '*');
      stream.pipe(res);
    } catch (error) {
      throw new NotFoundException('File not found');
    }
  }
}
