import { Controller, Get, Query, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { DeployParams } from './types';
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async getHello(@Query() data: object): Promise<string> {
    console.log(data);
    return this.appService.getHello(data);
  }

  @Post()
  async deploy(@Body() params: DeployParams): Promise<string> {
    return this.appService.deploy(params);
  }
}
