import { Controller, Get } from '@nestjs/common'
import { MicrolearningService } from './microlearning.service.js'

@Controller('microlearning')
export class MicrolearningController {
  constructor(private readonly microlearningService: MicrolearningService) {}

  @Get()
  getInfo() {
    return this.microlearningService.getInfo()
  }
}
