import { Controller, Get, Query, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { DeployParams, GetPaymentAddressParams, WithdrawParams } from './types';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async getHello(@Query() data: object): Promise<string> {
    return this.appService.getHello();
  }

  @Post('deploy')
  async deploy(@Body() params: DeployParams): Promise<string> {
    return this.appService.deploy(params);
  }

  @Get('deposit')
  async deposit(@Query() params: GetPaymentAddressParams): Promise<string> {
    return this.appService.deposit(params);
  }
  @Get('withdraw')
  async withdraw(@Query() params: WithdrawParams): Promise<string> {
    return this.appService.withdraw(params);
  }
}
