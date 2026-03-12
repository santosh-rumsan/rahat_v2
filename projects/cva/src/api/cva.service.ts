import { Injectable } from '@nestjs/common'

@Injectable()
export class CvaService {
  getInfo() {
    return {
      type: 'CVA',
      name: 'Cash Voucher Assistance',
      description: 'Distribute cash vouchers to beneficiaries',
    }
  }
}
