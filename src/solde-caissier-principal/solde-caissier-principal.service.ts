import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SoldeCaissierPrincipal, SoldeCaissierPrincipalDocument } from './entities/solde-caissier-principal.entity';
import { HistoriqueSoldeService } from 'src/historique-solde/historique-solde.service';
import { TYPE_ACTEUR, TYPE_MOUVEMENT } from 'src/historique-solde/entities/historique-solde.entity';

@Injectable()
export class SoldeCaissierPrincipalService {
  constructor(
    @InjectModel(SoldeCaissierPrincipal.name, 'ecampus') private soldeCaissierPrincipalModel: Model<SoldeCaissierPrincipalDocument>,
    private readonly historiqueSoldeService: HistoriqueSoldeService
  ) {}

  async findAll(): Promise<SoldeCaissierPrincipal[]> {
    try {
      return this.soldeCaissierPrincipalModel.find().exec();
    } catch (error) {
      throw new HttpException(error.message, error.statusCode || 500);
    }
  }

  async findByCaissierPrincipal(caissier_principal_id: string): Promise<SoldeCaissierPrincipal> {
    try {
      return this.soldeCaissierPrincipalModel.findOne({ caissier_principal_id }).exec();
    } catch (error) {
      throw new HttpException(error.message, error.statusCode || 500);
    }
  }

  async findOne(id: string): Promise<SoldeCaissierPrincipal> {
    try {
      return this.soldeCaissierPrincipalModel.findById(id).exec();
    } catch (error) {
      throw new HttpException(error.message, error.statusCode || 500);
    }
  }

  async getSolde(caissier_principal_id: string): Promise<number> {
    try {
      const solde = await this.soldeCaissierPrincipalModel.findOne({ caissier_principal_id });
      return solde ? Number(solde.solde || 0) : 0;
    } catch (error) {
      throw new HttpException(error.message, error.statusCode || 500);
    }
  }

  async ajouterSolde(
    caissier_principal_id: string,
    montant: number,
    source_acteur_id?: string,
    source_type_acteur?: TYPE_ACTEUR,
    reference_versement_id?: string,
    description?: string
  ): Promise<SoldeCaissierPrincipal> {
    try {
      let soldeCaissierPrincipal = await this.soldeCaissierPrincipalModel.findOne({ caissier_principal_id });
      const soldeAvant = soldeCaissierPrincipal ? Number(soldeCaissierPrincipal.solde || 0) : 0;
      const soldeApres = soldeAvant + Number(montant);

      if (!soldeCaissierPrincipal) {
        soldeCaissierPrincipal = await this.soldeCaissierPrincipalModel.create({
          caissier_principal_id,
          solde: Number(montant)
        });
      } else {
        soldeCaissierPrincipal = await this.soldeCaissierPrincipalModel.findOneAndUpdate(
          { caissier_principal_id },
          { solde: soldeApres },
          { new: true }
        );
      }

      await this.historiqueSoldeService.create({
        acteur_id: caissier_principal_id,
        type_acteur: TYPE_ACTEUR.CAISSIER_PRINCIPAL,
        type_mouvement: TYPE_MOUVEMENT.CREDIT,
        montant: Number(montant),
        solde_avant: soldeAvant,
        solde_apres: soldeApres,
        source_acteur_id,
        source_type_acteur,
        reference_versement_id,
        description: description || `Crédit de ${montant} sur le solde caissier principal`
      });

      return soldeCaissierPrincipal;
    } catch (error) {
      throw new HttpException(error.message, error.statusCode || 500);
    }
  }

  async retirerSolde(
    caissier_principal_id: string,
    montant: number,
    destination_acteur_id?: string,
    destination_type_acteur?: TYPE_ACTEUR,
    reference_versement_id?: string,
    description?: string
  ): Promise<SoldeCaissierPrincipal> {
    try {
      const soldeCaissierPrincipal = await this.soldeCaissierPrincipalModel.findOne({ caissier_principal_id });

      if (!soldeCaissierPrincipal) {
        throw new BadRequestException('Solde caissier principal introuvable');
      }

      const soldeAvant = Number(soldeCaissierPrincipal.solde || 0);
      if (soldeAvant < Number(montant)) {
        throw new BadRequestException(`Solde insuffisant. Disponible: ${soldeAvant}, Demandé: ${montant}`);
      }

      const soldeApres = soldeAvant - Number(montant);

      const updated = await this.soldeCaissierPrincipalModel.findOneAndUpdate(
        { caissier_principal_id },
        { solde: soldeApres },
        { new: true }
      );

      await this.historiqueSoldeService.create({
        acteur_id: caissier_principal_id,
        type_acteur: TYPE_ACTEUR.CAISSIER_PRINCIPAL,
        type_mouvement: TYPE_MOUVEMENT.DEBIT,
        montant: Number(montant),
        solde_avant: soldeAvant,
        solde_apres: soldeApres,
        destination_acteur_id,
        destination_type_acteur,
        reference_versement_id,
        description: description || `Débit de ${montant} du solde caissier principal`
      });

      return updated;
    } catch (error) {
      throw new HttpException(error.message, error.statusCode || 500);
    }
  }
}
