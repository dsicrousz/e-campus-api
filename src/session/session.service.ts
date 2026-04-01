import { BadRequestException, HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { Session, SessionDocument } from './entities/session.entity';

@Injectable()
export class SessionService {
  constructor(
    @InjectModel(Session.name, 'ecampus') private sessionModel: Model<SessionDocument>,
  ) {}

  async create(createSessionDto: CreateSessionDto): Promise<Session> {
    try {
      // Si cette session doit être active, désactiver les autres
      if (createSessionDto.isActive) {
        await this.sessionModel.updateMany({ isActive: true }, { isActive: false });
      }

      // Vérifier que dateDebut < dateFin
      const debut = new Date(createSessionDto.dateDebut);
      const fin = new Date(createSessionDto.dateFin);
      if (debut >= fin) {
        throw new BadRequestException('La date de début doit être antérieure à la date de fin');
      }

      const session = new this.sessionModel(createSessionDto);
      return await session.save();
    } catch (error) {
      throw new HttpException(error.message, error.statusCode || 500);
    }
  }

  async findAll(): Promise<Session[]> {
    try {
      return await this.sessionModel.find().sort({ annee: -1 }).exec();
    } catch (error) {
      throw new HttpException(error.message, 500);
    }
  }

  async findOne(id: string): Promise<Session> {
    try {
      const session = await this.sessionModel.findById(id).exec();
      if (!session) {
        throw new NotFoundException('Session non trouvée');
      }
      return session;
    } catch (error) {
      throw new HttpException(error.message, error.statusCode || 500);
    }
  }

  async findByAnnee(annee: string): Promise<Session> {
    try {
      const session = await this.sessionModel.findOne({ annee }).exec();
      if (!session) {
        throw new NotFoundException(`Session ${annee} non trouvée`);
      }
      return session;
    } catch (error) {
      throw new HttpException(error.message, error.statusCode || 500);
    }
  }

  /**
   * Récupère la session active
   */
  async getActiveSession(): Promise<Session> {
    try {
      const session = await this.sessionModel.findOne({ isActive: true }).exec();
      if (!session) {
        throw new NotFoundException('Aucune session active. Veuillez activer une session.');
      }
      return session;
    } catch (error) {
      throw new HttpException(error.message, error.statusCode || 500);
    }
  }

  /**
   * Active une session (désactive automatiquement les autres)
   */
  async activateSession(id: string): Promise<Session> {
    try {
      // Désactiver toutes les sessions
      await this.sessionModel.updateMany({ isActive: true }, { isActive: false });

      // Activer la session spécifiée
      const session = await this.sessionModel.findByIdAndUpdate(
        id,
        { isActive: true },
        { new: true }
      ).exec();

      if (!session) {
        throw new NotFoundException('Session non trouvée');
      }

      return session;
    } catch (error) {
      throw new HttpException(error.message, error.statusCode || 500);
    }
  }

  async update(id: string, updateSessionDto: UpdateSessionDto): Promise<Session> {
    try {
      // Si on veut activer cette session, désactiver les autres
      if (updateSessionDto.isActive) {
        await this.sessionModel.updateMany(
          { _id: { $ne: id }, isActive: true },
          { isActive: false }
        );
      }

      // Vérifier les dates si elles sont fournies
      if (updateSessionDto.dateDebut || updateSessionDto.dateFin) {
        const session = await this.findOne(id);
        const debut = new Date(updateSessionDto.dateDebut || session.dateDebut);
        const fin = new Date(updateSessionDto.dateFin || session.dateFin);
        
        if (debut >= fin) {
          throw new BadRequestException('La date de début doit être antérieure à la date de fin');
        }
      }

      const session = await this.sessionModel.findByIdAndUpdate(
        id,
        updateSessionDto,
        { new: true }
      ).exec();

      if (!session) {
        throw new NotFoundException('Session non trouvée');
      }

      return session;
    } catch (error) {
      throw new HttpException(error.message, error.statusCode || 500);
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const session = await this.sessionModel.findById(id);
      if (!session) {
        throw new NotFoundException('Session non trouvée');
      }

      if (session.isActive) {
        throw new BadRequestException('Impossible de supprimer la session active');
      }

      await this.sessionModel.findByIdAndDelete(id).exec();
    } catch (error) {
      throw new HttpException(error.message, error.statusCode || 500);
    }
  }
}
