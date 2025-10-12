import { Test, TestingModule } from '@nestjs/testing';
import { CompanyContextController } from './company-context.controller';
import { CompanyContextService } from './company-context.service';

describe('CompanyContextController', () => {
  let controller: CompanyContextController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompanyContextController],
      providers: [CompanyContextService],
    }).compile();

    controller = module.get<CompanyContextController>(CompanyContextController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
