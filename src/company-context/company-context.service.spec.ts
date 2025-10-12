import { Test, TestingModule } from '@nestjs/testing';
import { CompanyContextService } from './company-context.service';

describe('CompanyContextService', () => {
  let service: CompanyContextService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CompanyContextService],
    }).compile();

    service = module.get<CompanyContextService>(CompanyContextService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
