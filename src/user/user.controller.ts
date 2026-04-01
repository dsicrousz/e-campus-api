import {
  Controller,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { BetterAuthGuard } from 'src/auth/better-auth.guard';

@Controller('user')
@UseGuards(BetterAuthGuard)
export class UserController {
  constructor(
    private readonly userService: UserService,
  ) {}

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get('byrole/:role')
  findByRole(@Param('role') role: string) {
    return this.userService.findByRole(role);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }
}
