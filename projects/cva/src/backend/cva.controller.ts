import { Controller, Get } from '@nestjs/common'
import { CvaService } from './cva.service.js'

@Controller('cva')
export class CvaController {
  constructor(private readonly cvaService: CvaService) {}

  @Get()
  getInfo() {
    return this.cvaService.getInfo()
  }
}
