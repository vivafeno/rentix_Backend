import { Injectable } from '@nestjs/common';
import { CreateUserCompanyRoleDto } from './dto/create-user-company-role.dto';
import { UpdateUserCompanyRoleDto } from './dto/update-user-company-role.dto';

@Injectable()
export class UserCompanyRoleService {
  create(createUserCompanyRoleDto: CreateUserCompanyRoleDto) {
    return 'This action adds a new userCompanyRole';
  }

  findAll() {
    return `This action returns all userCompanyRole`;
  }

  findOne(id: number) {
    return `This action returns a #${id} userCompanyRole`;
  }

  update(id: number, updateUserCompanyRoleDto: UpdateUserCompanyRoleDto) {
    return `This action updates a #${id} userCompanyRole`;
  }

  remove(id: number) {
    return `This action removes a #${id} userCompanyRole`;
  }
}
