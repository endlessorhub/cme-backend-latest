import {
  Injectable,
  Logger /*, HttpException, HttpStatus*/,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { isEmpty } from 'lodash';
import { UserGlobalMKC } from 'apps/cme-backend/src/user-global-mkc/user-global-mkc.entity';

@Injectable()
export class BlockchainMsIngameMKCService {
  private logger: Logger = new Logger('BlockchainMsIngameMKCService');

  constructor(
    @InjectRepository(UserGlobalMKC)
    private userMKCBalanceRepository: Repository<UserGlobalMKC>,
  ) {}

  async getBalance(userId: number): Promise<any> {
    const balanceOrEmpty = await this.userMKCBalanceRepository.findOne({
      where: { user: { id: userId } },
    });

    if (isEmpty(balanceOrEmpty)) {
      this.userMKCBalanceRepository.save({
        balance: 0,
        user: {
          id: userId,
        },
      });
    }

    return {
      balance: balanceOrEmpty?.balance | 0,
    };
  }
}
