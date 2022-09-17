import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRepository } from './user.repository';
const HDWallet = require('ethereum-hdwallet');
const mnemonic =
  'tag volcano eight thank tide danger coast health above argue embrace heavy';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserRepository)
    private readonly usersRepository: UserRepository,
  ) {
    //
  }

  async create(user: CreateUserDto): Promise<User> {
    const hdwallet = HDWallet.fromMnemonic(mnemonic);
    const mywallet = hdwallet.derive(`m/44'/60'/0'/0`);
    const getAllUsers: any = this.usersRepository.findAll();
    const lastDrive: any = Math.max(...getAllUsers.map((o) => o.derive));
    const newDrive = lastDrive.derive++;
    user.password = await bcrypt.hash(user.password, 10);
    user.ethWalletAddresses = `0x${mywallet
      .derive(newDrive)
      .getAddress()
      .toString('hex')}`;

    user.ethPrivateKey = `${mywallet
      .derive(newDrive)
      .getPrivateKey()
      .toString('hex')}`;
    return this.usersRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    // todo:
    //  soft delete
    //  validation
    //  don't remove yourself
    await this.usersRepository.delete(id);
  }
}
