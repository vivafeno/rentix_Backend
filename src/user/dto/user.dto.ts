import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from 'src/common/base/base.entity';

export class UserDto extends BaseEntity{

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 'superadmin', required: false })
  globalRole?: string;

}
