import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SoldeRecouvreur, SoldeRecouvreurDocument } from './entities/solde-recouvreur.entity';
import { HistoriqueSoldeService } from 'src/historique-solde/historique-solde.service';
import { TYPE_ACTEUR, TYPE_MOUVEMENT } from 'src/historique-solde/entities/historique-solde.entity';

@Injectable()
export class SoldeRecouvreurService {
  constructor(
    @InjectModel(SoldeRecouvreur.name, 'ecampus') private soldeRecouvreurModel: Model<SoldeRecouvreurDocument>,
    private readonly historiqueSoldeService: HistoriqueSoldeService
  ) {}

  async findAll(): Promise<SoldeRecouvreur[]> {
    try {
      return this.soldeRecouvreurModel.find().exec();
    } catch (error) {
      throw new HttpException(error.message, error.statusCode || 500);
    }
  }

  async findByRecouvreur(recouvreur_id: string): Promise<SoldeRecouvreur> {
    try {
      return this.soldeRecouvreurModel.findOne({ recouvreur_id }).exec();
    } catch (error) {
      throw new HttpException(error.message, error.statusCode || 500);
    }
  }

  async findOne(id: string): Promise<SoldeRecouvreur> {
    try {
      return this.soldeRecouvreurModel.findById(id).exec();
    } catch (error) {
      throw new HttpException(error.message, error.statusCode || 500);
    }
  }

  async getSolde(recouvreur_id: string): Promise<number> {
    try {
      const solde = await this.soldeRecouvreurModel.findOne({ recouvreur_id });
      return solde ? Number(solde.solde || 0) : 0;
    } catch (error) {
      throw new HttpException(error.message, error.statusCode || 500);
    }
  }

  async ajouterSolde(
    recouvreur_id: string,
    montant: number,
    source_acteur_id?: string,
    source_type_acteur?: TYPE_ACTEUR,
    reference_versement_id?: string,
    description?: string
  ): Promise<SoldeRecouvreur> {
    try {
      let soldeRecouvreur = await this.soldeRecouvreurModel.findOne({ recouvreur_id });
      const soldeAvant = soldeRecouvreur ? Number(soldeRecouvreur.solde || 0) : 0;
      const soldeApres = soldeAvant + Number(montant);

      if (!soldeRecouvreur) {
        soldeRecouvreur = await this.soldeRecouvreurModel.create({
          recouvreur_id,
          solde: Number(montant)
        });
      } else {
        soldeRecouvreur = await this.soldeRecouvreurModel.findOneAndUpdate(
          { recouvreur_id },
          { solde: soldeApres },
          { new: true }
        );
      }

      await this.historiqueSoldeService.create({
        acteur_id: recouvreur_id,
        type_acteur: TYPE_ACTEUR.RECOUVREUR,
        type_mouvement: TYPE_MOUVEMENT.CREDIT,
        montant: Number(montant),
        solde_avant: soldeAvant,
        solde_apres: soldeApres,
        source_acteur_id,
        source_type_acteur,
        reference_versement_id,
        description: description || `Crédit de ${montant} sur le solde recouvreur`
      });

      return soldeRecouvreur;
    } catch (error) {
      throw new HttpException(error.message, error.statusCode || 500);
    }
  }

  async retirerSolde(
    recouvreur_id: string,
    montant: number,
    destination_acteur_id?: string,
    destination_type_acteur?: TYPE_ACTEUR,
    reference_versement_id?: string,
    description?: string
  ): Promise<SoldeRecouvreur> {
    try {
      const soldeRecouvreur = await this.soldeRecouvreurModel.findOne({ recouvreur_id });

      if (!soldeRecouvreur) {
        throw new BadRequestException('Solde recouvreur introuvable');
      }

      const soldeAvant = Number(soldeRecouvreur.solde || 0);
      if (soldeAvant < Number(montant)) {
        throw new BadRequestException(`Solde insuffisant. Disponible: ${soldeAvant}, Demandé: ${montant}`);
      }

      const soldeApres = soldeAvant - Number(montant);

      const updated = await this.soldeRecouvreurModel.findOneAndUpdate(
        { recouvreur_id },
        { solde: soldeApres },
        { new: true }
      );

      await this.historiqueSoldeService.create({
        acteur_id: recouvreur_id,
        type_acteur: TYPE_ACTEUR.RECOUVREUR,
        type_mouvement: TYPE_MOUVEMENT.DEBIT,
        montant: Number(montant),
        solde_avant: soldeAvant,
        solde_apres: soldeApres,
        destination_acteur_id,
        destination_type_acteur,
        reference_versement_id,
        description: description || `Débit de ${montant} du solde recouvreur`
      });

      return updated;
    } catch (error) {
      throw new HttpException(error.message, error.statusCode || 500);
    }
  }
}
