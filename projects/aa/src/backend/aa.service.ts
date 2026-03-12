import { Injectable } from '@nestjs/common'

@Injectable()
export class AaService {
  getInfo() {
    return {
      type: 'ANTICIPATORY_ACTION',
      name: 'Anticipatory Action',
      description: 'Take anticipatory actions before disasters strike',
    }
  }
}
