import { BadRequestException, HttpException, Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Soldecaissier } from './entities/soldecaissier.entity';
import { HistoriqueSoldeService } from 'src/historique-solde/historique-solde.service';
import { TYPE_ACTEUR, TYPE_MOUVEMENT } from 'src/historique-solde/entities/historique-solde.entity';

@Injectable()
export class SoldecaissierService {
  constructor(
    @InjectModel(Soldecaissier.name,'ecampus') private soldecaissierModel: Model<Soldecaissier>,
    @Inject(forwardRef(() => HistoriqueSoldeService)) private readonly historiqueSoldeService: HistoriqueSoldeService
  ) {}

  async findAll(): Promise<Soldecaissier[]> {
    try {
      return this.soldecaissierModel.find().exec();
    } catch (error) {
      throw new HttpException(error.message, error.statusCode || 500);
    }
  }

  async findByCaissier(id: string): Promise<Soldecaissier> {
    try {
      return this.soldecaissierModel.findOne({caissier_id:id}).exec();
    } catch (error) {
      throw new HttpException(error.message, error.statusCode || 500);
    }
  }

  async findOne(id: string): Promise<Soldecaissier> {
    try {
      return this.soldecaissierModel.findById(id).exec();
    } catch (error) {
      throw new HttpException(error.message, error.statusCode || 500);
    }
  }

  /**
   * Ajoute un montant au solde d'un caissier
   * @param caissier_id ID du caissier
   * @param montant Montant à ajouter
   */
  async ajouterSolde(
    caissier_id: string, 
    montant: number,
    description?: string
  ): Promise<Soldecaissier> {
    try {
      const soldecaissier = await this.soldecaissierModel.findOne({ caissier_id });
      const soldeAvant = soldecaissier ? Number(soldecaissier.solde || 0) : 0;
      const soldeApres = soldeAvant + Number(montant);
      
      let result: Soldecaissier;
      if (!soldecaissier) {
        result = await this.soldecaissierModel.create({
          caissier_id,
          solde: Number(montant)
        });
      } else {
        result = await this.soldecaissierModel.findOneAndUpdate(
          { caissier_id },
          { solde: soldeApres },
          { new: true }
        );
      }

      await this.historiqueSoldeService.create({
        acteur_id: caissier_id,
        type_acteur: TYPE_ACTEUR.VENDEUR,
        type_mouvement: TYPE_MOUVEMENT.CREDIT,
        montant: Number(montant),
        solde_avant: soldeAvant,
        solde_apres: soldeApres,
        description: description || `Crédit de ${montant} sur le solde caissier`
      });

      return result;
    } catch (error) {
      throw new HttpException(error.message, error.statusCode || 500);
    }
  }

  /**
   * Retire un montant du solde d'un caissier
   * @param caissier_id ID du caissier
   * @param montant Montant à retirer
   */
  async retirerSolde(
    caissier_id: string, 
    montant: number,
    description?: string
  ): Promise<Soldecaissier> {
    try {
      const soldecaissier = await this.soldecaissierModel.findOne({ caissier_id });
      
      if (!soldecaissier) {
        throw new BadRequestException('Solde caissier introuvable');
      }
      
      const soldeAvant = Number(soldecaissier.solde || 0);
      if (soldeAvant < Number(montant)) {
        throw new BadRequestException(`Solde insuffisant. Disponible: ${soldeAvant}, Demandé: ${montant}`);
      }
      
      const soldeApres = soldeAvant - Number(montant);
      
      const result = await this.soldecaissierModel.findOneAndUpdate(
        { caissier_id },
        { solde: soldeApres },
        { new: true }
      );

      await this.historiqueSoldeService.create({
        acteur_id: caissier_id,
        type_acteur: TYPE_ACTEUR.VENDEUR,
        type_mouvement: TYPE_MOUVEMENT.DEBIT,
        montant: Number(montant),
        solde_avant: soldeAvant,
        solde_apres: soldeApres,
        description: description || `Débit de ${montant} du solde caissier`
      });

      return result;
    } catch (error) {
      throw new HttpException(error.message, error.statusCode || 500);
    }
  }

  /**
   * Récupère le solde d'un caissier
   * @param caissier_id ID du caissier
   */
  async getSolde(caissier_id: string): Promise<number> {
    try {
      const soldecaissier = await this.soldecaissierModel.findOne({ caissier_id });
      if (!soldecaissier) {
        return 0;
      }
      return Number(soldecaissier.solde || 0);
    } catch (error) {
      throw new HttpException(error.message, error.statusCode || 500);
    }
  }

}
