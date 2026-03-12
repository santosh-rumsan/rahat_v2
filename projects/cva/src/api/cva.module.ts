import { Module } from '@nestjs/common'
import { CvaController } from './cva.controller.js'
import { CvaService } from './cva.service.js'

@Module({
  controllers: [CvaController],
  providers: [CvaService],
})
export class CvaModule {}
