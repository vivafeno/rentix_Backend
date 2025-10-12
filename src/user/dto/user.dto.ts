import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty({ example: '7c84c5a1-3f2e-4d9e-98d5-3a2a5d67b2d3' })
  id: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 'superadmin', required: false })
  globalRole?: string;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: '2025-09-12T08:12:00.000Z' })
  created_at: Date;

  @ApiProperty({ example: '2025-09-12T08:15:00.000Z' })
  updated_at: Date;
}
