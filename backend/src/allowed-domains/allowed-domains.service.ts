import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAllowedDomainDto } from './dto/create-allowed-domain.dto';
import { UpdateAllowedDomainDto } from './dto/update-allowed-domain.dto';

@Injectable()
export class AllowedDomainsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.allowedDomain.findMany({
      orderBy: { domain: 'asc' },
    });
  }

  async create(userId: string, dto: CreateAllowedDomainDto) {
    if (!dto.domain) {
      throw new BadRequestException('domain is required');
    }
    return this.prisma.allowedDomain.create({
      data: {
        domain: dto.domain.toLowerCase(),
        isActive: dto.isActive ?? true,
        autoAssignTeamId: dto.autoAssignTeamId || null,
        autoAssignDepartmentId: dto.autoAssignDepartmentId || null,
        createdBy: userId,
      },
    });
  }

  async update(id: string, _userId: string, dto: UpdateAllowedDomainDto) {
    const existing = await this.prisma.allowedDomain.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Allowed domain not found');
    }
    return this.prisma.allowedDomain.update({
      where: { id },
      data: {
        domain: dto.domain ? dto.domain.toLowerCase() : undefined,
        isActive: dto.isActive,
        autoAssignTeamId: dto.autoAssignTeamId !== undefined ? dto.autoAssignTeamId : undefined,
        autoAssignDepartmentId: dto.autoAssignDepartmentId !== undefined ? dto.autoAssignDepartmentId : undefined,
      },
    });
  }

  async remove(id: string, _userId: string) {
    await this.prisma.allowedDomain.delete({ where: { id } });
    return { success: true };
  }
}


