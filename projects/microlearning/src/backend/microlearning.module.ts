import { Module } from '@nestjs/common'
import { MicrolearningController } from './microlearning.controller.js'
import { MicrolearningService } from './microlearning.service.js'

@Module({
  controllers: [MicrolearningController],
  providers: [MicrolearningService],
})
export class MicrolearningModule {}
