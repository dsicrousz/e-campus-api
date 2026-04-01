import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // @Get("/debug-sentry")
  //   getError() {
  //     // Send a log before throwing the error
  //     Sentry.logger.info('User triggered test error', {
  //       action: 'test_error_endpoint',
  //     });
  //     throw new Error("My first Sentry error!");
  //   } 
}
