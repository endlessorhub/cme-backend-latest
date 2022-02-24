import { EntityRepository, Repository } from 'typeorm';
import { User } from './user.entity';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  // constructor() {
  //   super();
  //
  //   const rep = new Repository();
  //   console.log(this);
  // }


  async findAll(): Promise<User[]> {
    return await this.find();
  }

  async findOneByUsername(username: string): Promise<User> {
    return this.findOne({ username });
  }
}
