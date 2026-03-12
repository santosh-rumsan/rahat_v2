import { Module } from '@nestjs/common'
import { AaController } from './aa.controller.js'
import { AaService } from './aa.service.js'

@Module({
  controllers: [AaController],
  providers: [AaService],
})
export class AaModule {}
