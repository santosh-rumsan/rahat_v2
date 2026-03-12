import { Injectable } from '@nestjs/common'

@Injectable()
export class MicrolearningService {
  getInfo() {
    return {
      type: 'MICROLEARNING',
      name: 'Microlearning',
      description: 'Deliver learning content to beneficiaries',
    }
  }
}
