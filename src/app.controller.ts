import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async getHello(@Query() data: object): Promise<string> {
    console.log(data);

    return this.appService.getHello(data);
  }
}
