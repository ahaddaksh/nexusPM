import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AllowedDomainsService } from './allowed-domains.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CreateAllowedDomainDto } from './dto/create-allowed-domain.dto';
import { UpdateAllowedDomainDto } from './dto/update-allowed-domain.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('allowed-domains')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AllowedDomainsController {
  constructor(private readonly service: AllowedDomainsService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Post()
  create(@CurrentUser() user: any, @Body() dto: CreateAllowedDomainDto) {
    return this.service.create(user.id, dto);
  }

  @Patch(':id')
  update(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: UpdateAllowedDomainDto) {
    return this.service.update(id, user.id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.service.remove(id, user.id);
  }
}


