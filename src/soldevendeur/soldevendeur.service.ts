import { BadRequestException, HttpException, Inject, Injectable, forwardRef } from '@nestjs/common';
import { Soldevendeur } from './entities/soldevendeur.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HistoriqueSoldeService } from 'src/historique-solde/historique-solde.service';
import { TYPE_ACTEUR, TYPE_MOUVEMENT } from 'src/historique-solde/entities/historique-solde.entity';

@Injectable()
export class SoldevendeurService {
  constructor(
    @InjectModel(Soldevendeur.name,'ecampus') private soldevendeurModel: Model<Soldevendeur>,
    @Inject(forwardRef(() => HistoriqueSoldeService)) private readonly historiqueSoldeService: HistoriqueSoldeService
  ) {}
 async findAll(): Promise<Soldevendeur[]> {
    try {
      return this.soldevendeurModel.find().exec();
    } catch (error) {
      throw new HttpException(error.message, error.statusCode || 500);
    }
  }

  async findByVendeur(id: string): Promise<Soldevendeur> {
    try {
      return this.soldevendeurModel.findOne({vendeur_id:id}).exec();
    } catch (error) {
      throw new HttpException(error.message, error.statusCode || 500);
    }
  }

  async findOne(id: string): Promise<Soldevendeur> {
    try {
      return this.soldevendeurModel.findById(id).exec();
    } catch (error) {
      throw new HttpException(error.message, error.statusCode || 500);
    }
  }

  /**
   * Ajoute un montant au solde d'un vendeur
   * @param vendeur_id ID du vendeur
   * @param montant Montant à ajouter
   */
  async ajouterSolde(
    vendeur_id: string, 
    montant: number,
    description?: string
  ): Promise<Soldevendeur> {
    try {
      const soldevendeur = await this.soldevendeurModel.findOne({ vendeur_id });
      const soldeAvant = soldevendeur ? Number(soldevendeur.solde || 0) : 0;
      const soldeApres = soldeAvant + Number(montant);
      
      let result: Soldevendeur;
      if (!soldevendeur) {
        result = await this.soldevendeurModel.create({
          vendeur_id,
          solde: Number(montant)
        });
      } else {
        result = await this.soldevendeurModel.findOneAndUpdate(
          { vendeur_id },
          { solde: soldeApres },
          { new: true }
        );
      }

      await this.historiqueSoldeService.create({
        acteur_id: vendeur_id,
        type_acteur: TYPE_ACTEUR.VENDEUR,
        type_mouvement: TYPE_MOUVEMENT.CREDIT,
        montant: Number(montant),
        solde_avant: soldeAvant,
        solde_apres: soldeApres,
        description: description || `Crédit de ${montant} sur le solde vendeur`
      });

      return result;
    } catch (error) {
      throw new HttpException(error.message, error.statusCode || 500);
    }
  }

  /**
   * Retire un montant du solde d'un vendeur
   * @param vendeur_id ID du vendeur
   * @param montant Montant à retirer
   */
  async retirerSolde(
    vendeur_id: string, 
    montant: number,
    description?: string
  ): Promise<Soldevendeur> {
    try {
      const soldevendeur = await this.soldevendeurModel.findOne({ vendeur_id });
      
      if (!soldevendeur) {
        throw new BadRequestException('Solde vendeur introuvable');
      }
      
      const soldeAvant = Number(soldevendeur.solde);
      if (soldeAvant < Number(montant)) {
        throw new BadRequestException(`Solde insuffisant. Disponible: ${soldeAvant}, Demandé: ${montant}`);
      }
      
      const soldeApres = soldeAvant - Number(montant);
      
      const result = await this.soldevendeurModel.findOneAndUpdate(
        { vendeur_id },
        { solde: soldeApres },
        { new: true }
      );

      await this.historiqueSoldeService.create({
        acteur_id: vendeur_id,
        type_acteur: TYPE_ACTEUR.VENDEUR,
        type_mouvement: TYPE_MOUVEMENT.DEBIT,
        montant: Number(montant),
        solde_avant: soldeAvant,
        solde_apres: soldeApres,
        description: description || `Débit de ${montant} du solde vendeur`
      });

      return result;
    } catch (error) {
      throw new HttpException(error.message, error.statusCode || 500);
    }
  }

  /**
   * Récupère le solde d'un vendeur
   * @param vendeur_id ID du vendeur
   */
  async getSolde(vendeur_id: string): Promise<number> {
    try {
      const soldevendeur = await this.soldevendeurModel.findOne({ vendeur_id });
      if (!soldevendeur) {
        return 0;
      }
      return Number(soldevendeur.solde || 0);
    } catch (error) {
      throw new HttpException(error.message, error.statusCode || 500);
    }
  }

}
