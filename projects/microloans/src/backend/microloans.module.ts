import { Module } from '@nestjs/common'
import { MicroloansController } from './microloans.controller.js'
import { MicroloansService } from './microloans.service.js'

@Module({
  controllers: [MicroloansController],
  providers: [MicroloansService],
})
export class MicroloansModule {}
