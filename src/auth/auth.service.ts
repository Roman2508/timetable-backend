import { Injectable } from '@nestjs/common';
import { UsersService } from './../users/users.service';

@Injectable()
export class AuthclearService {
  constructor(private usersService: UsersService) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);

    if (user && user.password === password) {
      const { password, ...restult } = user;
      return restult;
    }

    return null;
  }
}
