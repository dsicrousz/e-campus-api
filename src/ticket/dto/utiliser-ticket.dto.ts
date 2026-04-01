import { IsString, IsMongoId, IsOptional } from 'class-validator';

export class UtiliserTicketDto {
  @IsString()
  compteId: string; // Code QR de l'étudiant

  @IsMongoId()
  ticketId: string; // ID du ticket à utiliser

  @IsMongoId()
  serviceId: string; // ID du service où le ticket est utilisé

  @IsMongoId()
  agentControleId: string; // ID de l'agent qui valide

  @IsOptional()
  @IsString()
  notes?: string;
}
