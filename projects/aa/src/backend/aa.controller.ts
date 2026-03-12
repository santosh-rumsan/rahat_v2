import { Controller, Get } from '@nestjs/common'
import { AaService } from './aa.service.js'

@Controller('aa')
export class AaController {
  constructor(private readonly aaService: AaService) {}

  @Get()
  getInfo() {
    return this.aaService.getInfo()
  }
}
