import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HistoriqueSolde, HistoriqueSoldeDocument, TYPE_ACTEUR } from './entities/historique-solde.entity';
import { CreateHistoriqueSoldeDto } from './dto/create-historique-solde.dto';
import { SessionService } from 'src/session/session.service';

@Injectable()
export class HistoriqueSoldeService {
  constructor(
    @InjectModel(HistoriqueSolde.name, 'ecampus') private historiqueModel: Model<HistoriqueSoldeDocument>,
    private readonly sessionService: SessionService
  ) {}

  async create(dto: CreateHistoriqueSoldeDto): Promise<HistoriqueSolde> {
    try {
      const sessionActive = await this.sessionService.getActiveSession();
      const historique = new this.historiqueModel({
        ...dto,
        session: sessionActive._id
      });
      return await historique.save();
    } catch (error) {
      throw new HttpException(error.message, error.statusCode || 500);
    }
  }

  async findByActeur(acteur_id: string, type_acteur: TYPE_ACTEUR): Promise<HistoriqueSolde[]> {
    try {
      const sessionActive = await this.sessionService.getActiveSession();
      return await this.historiqueModel
        .find({ acteur_id, type_acteur })
        .where('session', sessionActive._id)
        .sort({ createdAt: -1 })
        .exec();
    } catch (error) {
      throw new HttpException(error.message, error.statusCode || 500);
    }
  }

  async findByActeurWithDates(
    acteur_id: string,
    type_acteur: TYPE_ACTEUR,
    dateDebut?: string,
    dateFin?: string
  ): Promise<HistoriqueSolde[]> {
    try {
      const sessionActive = await this.sessionService.getActiveSession();
      const matchStage: any = {
        acteur_id,
        type_acteur
      };
      
      // Add session filter using where clause later

      if (dateDebut || dateFin) {
        matchStage.createdAt = {};
        if (dateDebut) matchStage.createdAt.$gte = new Date(dateDebut);
        if (dateFin) matchStage.createdAt.$lte = new Date(dateFin);
      }

      return await this.historiqueModel
        .find(matchStage)
        .where('session', sessionActive._id)
        .sort({ createdAt: -1 })
        .exec();
    } catch (error) {
      throw new HttpException(error.message, error.statusCode || 500);
    }
  }

  async findAll(): Promise<HistoriqueSolde[]> {
    try {
      const sessionActive = await this.sessionService.getActiveSession();
      return await this.historiqueModel
        .find()
        .where('session', sessionActive._id)
        .sort({ createdAt: -1 })
        .exec();
    } catch (error) {
      throw new HttpException(error.message, error.statusCode || 500);
    }
  }

  async findBySession(sessionId: string): Promise<HistoriqueSolde[]> {
    try {
      return await this.historiqueModel
        .find()
        .where('session', sessionId)
        .sort({ createdAt: -1 })
        .exec();
    } catch (error) {
      throw new HttpException(error.message, error.statusCode || 500);
    }
  }
}
