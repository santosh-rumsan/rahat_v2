import { Injectable } from '@nestjs/common'

@Injectable()
export class MicroloansService {
  getInfo() {
    return {
      type: 'MICROLOANS',
      name: 'Microloans',
      description: 'Provide small loans to beneficiaries',
    }
  }
}
