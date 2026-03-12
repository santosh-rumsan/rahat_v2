import { Controller, Get } from '@nestjs/common'
import { MicroloansService } from './microloans.service.js'

@Controller('microloans')
export class MicroloansController {
  constructor(private readonly microloansService: MicroloansService) {}

  @Get()
  getInfo() {
    return this.microloansService.getInfo()
  }
}
