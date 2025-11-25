import { IsBoolean, IsOptional, IsString, IsUUID, Matches } from 'class-validator';

export class CreateAllowedDomainDto {
  @IsString()
  @Matches(/^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/)
  domain!: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsUUID()
  autoAssignTeamId?: string;

  @IsOptional()
  @IsUUID()
  autoAssignDepartmentId?: string;
}


