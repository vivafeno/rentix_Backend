import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from 'src/common/base/base.entity';
import { UserGlobalRole } from '../entities/user.entity';

export class UserDto extends BaseEntity{

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 'superadmin, admin, user', required: true })
  userGlobalRole: UserGlobalRole;
}
