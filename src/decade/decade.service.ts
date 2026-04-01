import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cron } from '@nestjs/schedule';
import { Decade, DecadeDocument } from './entities/decade.entity';
import { CreateDecadeDto } from './dto/create-decade.dto';
import { UpdateDecadeDto } from './dto/update-decade.dto';
import { SessionService } from 'src/session/session.service';
import { Operation } from 'src/operation/entities/operation.entity';
import { nanoid } from 'nanoid';

@Injectable()
export class DecadeService {
  private readonly logger = new Logger(DecadeService.name);

  constructor(
    @InjectModel(Decade.name, 'ecampus')
    private decadeModel: Model<DecadeDocument>,
    private readonly sessionService: SessionService,
  ) {}

  async create(createDecadeDto: CreateDecadeDto): Promise<Decade> {
    try {
      // Récupérer la session active
      const sessionActive = await this.sessionService.getActiveSession();
      const createdDecade = new this.decadeModel({ ...createDecadeDto, session: sessionActive._id });
      return createdDecade.save();
    } catch (error) {
      throw new HttpException('Decade non ajoutée', HttpStatus.INTERNAL_SERVER_ERROR, { cause: error, description: 'Decade non ajoutée' });
    }
  }

  async findAll(): Promise<Decade[]> {
    try {
      const sessionActive = await this.sessionService.getActiveSession();
      return this.decadeModel.find().where('session', sessionActive._id).exec();
    } catch (error) {
      throw new HttpException('Decades non trouvées', HttpStatus.INTERNAL_SERVER_ERROR, { cause: error, description: 'Decades non trouvées' });
    }
  }

  async findOne(id: string) {
    try {
      return this.decadeModel.findById(id).exec();
    } catch (error) {
      throw new HttpException('Decade non trouvée', HttpStatus.INTERNAL_SERVER_ERROR, { cause: error, description: 'Decade non trouvée' });
    }
  }

  async findActiveDecade(): Promise<Decade | null> {
    try {
      const sessionActive = await this.sessionService.getActiveSession();
      return this.decadeModel.findOne({ active: true }).where('session', sessionActive._id).exec();
    } catch (error) {
      throw new HttpException('Decade non trouvée', HttpStatus.INTERNAL_SERVER_ERROR, { cause: error, description: 'Decade non trouvée' });
    }
  }

  /**
   * Récupère les décades d'une session spécifique
   */
  async findBySession(sessionId: string): Promise<Decade[]> {
    try {
      return this.decadeModel.find().where('session', sessionId).exec();
    } catch (error) {
      throw new HttpException('Decades non trouvées', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  update(id: string, updateDecadeDto: UpdateDecadeDto) {
    try {
      return this.decadeModel.findByIdAndUpdate(id, updateDecadeDto, { new: true });
    } catch (error) {
      throw new HttpException('Decade non mise à jour', HttpStatus.INTERNAL_SERVER_ERROR, { cause: error, description: 'Decade non mise à jour' });
    }
  }

  remove(id: string) {
    try {
      return this.decadeModel.findByIdAndDelete(id);
    } catch (error) {
      throw new HttpException('Decade non supprimée', HttpStatus.INTERNAL_SERVER_ERROR, { cause: error, description: 'Decade non supprimée' });
    }
  }

  async deactivateAllDecades(): Promise<void> {
    try {
      const sessionActive = await this.sessionService.getActiveSession();
      await this.decadeModel.updateMany({ session: sessionActive._id } as any, { active: false }).exec();
      this.logger.log('All previous decades deactivated');
    } catch (error) {
      this.logger.error('Error deactivating decades:', error);
      throw new HttpException('Erreur lors de la désactivation des décades', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async createNewDecade(): Promise<Decade> {
    try {
      const today = new Date();
      const dateDebut = new Date(today);
      const dateFin = new Date(today);
      dateFin.setDate(today.getDate() + 9);

      const nom = `Décade du ${today.toLocaleDateString()} au ${dateFin.toLocaleDateString()}`;
      const reference = `DEC-${nanoid()}`;

      const newDecade = await this.create({
        nom,
        reference,
        dateDebut,
        dateFin,
        active: true,
      });

      this.logger.log(`New decade created: ${nom} (${reference})`);
      return newDecade;
    } catch (error) {
      this.logger.error('Error creating new decade:', error);
      throw new HttpException('Erreur lors de la création de la décade', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Cron('0 1 * * *') // Run daily at 1 AM
  async handleDecadeCreation() {
    this.logger.log('Starting daily decade check');
    
    try {
      // Récupérer la session active
      const sessionActive = await this.sessionService.getActiveSession();
      
      // Find the currently active decade
      const activeDecade = await this.decadeModel.findOne({ active: true }).where('session', sessionActive._id).exec();
      
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to start of day
      
      if (!activeDecade) {
        this.logger.log('No active decade found, creating new one');
        await this.deactivateAllDecades();
        const newDecade = await this.createNewDecade();
        this.logger.log(`Created new decade: ${newDecade.nom}`);
        return;
      }
      
      const endDate = new Date(activeDecade.dateFin);
      endDate.setHours(0, 0, 0, 0); // Reset time to start of day
      
      if (endDate < today) {
        this.logger.log(`Active decade ${activeDecade.nom} has ended (${activeDecade.dateFin}), creating new one`);
        await this.deactivateAllDecades();
        const newDecade = await this.createNewDecade();
        this.logger.log(`Created new decade: ${newDecade.nom}`);
      } else {
        this.logger.log(`Active decade ${activeDecade.nom} still valid until ${activeDecade.dateFin}`);
      }
    } catch (error) {
      this.logger.error('Error during daily decade check:', error);
    }
  }

  // Method to manually trigger decade creation (for testing)
  async triggerDecadeCreation(): Promise<Decade> {
    await this.deactivateAllDecades();
    return this.createNewDecade();
  }
}
