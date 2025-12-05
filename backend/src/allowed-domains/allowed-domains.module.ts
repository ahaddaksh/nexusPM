import { Module } from '@nestjs/common';
import { AllowedDomainsService } from './allowed-domains.service';
import { AllowedDomainsController } from './allowed-domains.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AllowedDomainsController],
  providers: [AllowedDomainsService],
})
export class AllowedDomainsModule {}


