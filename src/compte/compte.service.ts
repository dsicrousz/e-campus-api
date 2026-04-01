import { BadRequestException, HttpException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CompteUpdatePassDto } from './dto/compte-update-pass-dto';
import { CompteLoginDto } from './dto/compteLoginDto';
import { CreateCompteDto } from './dto/create-compte.dto';
import { UpdateCompteDto } from './dto/update-compte.dto';
import { Compte, CompteDocument } from './entities/compte.entity';
import * as bcrypt from 'bcryptjs';
import { hashFromRequest } from '../utils/hash-pass-from-request';
import { Etudiant, EtudiantDocument } from '../etudiant/entities/etudiant.entity';

@Injectable()
export class CompteService {
  constructor(
    @InjectModel(Compte.name,'ecampus') private compteModel: Model<CompteDocument>,
    @InjectModel(Etudiant.name,'etudiant') private etudiantModel: Model<EtudiantDocument>,
    ){}


  async create(createCompteDto: CreateCompteDto):Promise<Compte> {
    try {
      const createCompte = await hashFromRequest(createCompteDto);
      const creadtedCompte = new this.compteModel(createCompte);
      return await creadtedCompte.save();
    } catch (error) {
     throw new HttpException(error.message, 500);
    }
  }

  async login(compteLoginDto: CompteLoginDto):Promise<Compte> {
      const compte = await this.findOneByCode(compteLoginDto.code);
      if(compte) {
        const isMatch = await bcrypt.compare(compteLoginDto.password, compte.password);
        if(isMatch) {
          delete compte.password;
        return compte; 
        }
        else {
          throw new BadRequestException("Mot de passe incorrect");
        }
      }
      throw new UnauthorizedException();
  }

  async loginWithNcs(compteLoginDto: CompteLoginDto):Promise<Compte> {
      const et = await this.etudiantModel.findOne({ncs:compteLoginDto.code});
      if(et) {
        const compte =  await this.compteModel.findOne({etudiant: et._id} as any).populate({path:'etudiant',model:this.etudiantModel});
      if(compte) {
              const isMatch = await bcrypt.compare(compteLoginDto.password, compte.password);
              if(isMatch) {
                delete compte.password;
              return compte; 
              }
              else {
                throw new BadRequestException("Mot de passe incorrect");
              }
            }

      }
      
      throw new UnauthorizedException();
  }

  async verifyPass(id:string,password: string):Promise<boolean> {
    const compte = await this.compteModel.findById(id);
    if(compte) {
      const isMatch = await bcrypt.compare(password, compte.password);
      if(isMatch) {
      return true; 
      }
      else {
        throw new BadRequestException("Mot de passe incorrect");
      }
    }
    throw new UnauthorizedException();
}

  async changepassword(id: string,compteUpdatePassDto: CompteUpdatePassDto):Promise<Compte> {
    const compte = await this.findOne(id);
    if(compte) {
      const isMatch = await bcrypt.compare(compteUpdatePassDto.oldPass, compte.password);
      if(isMatch) {
        const np = await hashFromRequest(compteUpdatePassDto);
        return  await this.update(id,{password: np.password})
      }
      else {
        throw new UnauthorizedException();
      }
    }
    throw new UnauthorizedException();
}

  async findAll(): Promise<Compte[]> {
  try {
    return await this.compteModel.find({},{password:0}).populate({path:'etudiant',model:this.etudiantModel});
  } catch (error) {
    throw new HttpException(error.message, 500);
  }
  }

  async getSumSolde(): Promise<any> {
    try {
      const soldes = await this.compteModel.aggregate([
        {
          $project: {
            totalTickets: {
              $sum: {
                $map: {
                  input: { $objectToArray: '$solde' },
                  as: 'item',
                  in: '$$item.v'
                }
              }
            }
          }
        },
        { $group: { _id: null, total: { $sum: '$totalTickets' } } }
      ]);
      return soldes[0]?.total || 0;
    } catch (error) {
      throw new HttpException(error.message, 500);
    }
  }

  async findOne(id: string): Promise<Compte> {
    try {
      return await this.compteModel.findById(id,{password:0}).populate({path:'etudiant',model:this.etudiantModel});
    } catch (error) {
      throw new HttpException(error.message, 500);
    }
  }
  async count(): Promise<number> {
    try {
      return await this.compteModel.countDocuments();
    } catch (error) {
      throw new HttpException(error.message, 500);
    }
  }

  async findOneByCode(code: string): Promise<Compte> {
    try {
      return await this.compteModel.findOne({code}).populate({path:'etudiant',model:this.etudiantModel});
    } catch (error) {
      throw new HttpException(error.message, 500);
    }
  }

  async findOneByNcs(ncs: string): Promise<Compte> {
    try {
      const et = await this.etudiantModel.findOne({ncs});
      if(et) {
        return await this.compteModel.findOne({etudiant: et._id} as any,{password:0}).populate({path:'etudiant',model:this.etudiantModel});
      }
      throw new BadRequestException("Numero non valide !");
    } catch (error) {
      throw new HttpException(error.message, 500);
    }
  }

  async findOneByEtudiant(id: string): Promise<Compte> {
    try {
      return await this.compteModel.findOne({etudiant: id} as any).populate({path:'etudiant',model:this.etudiantModel});
    } catch (error) {
      throw new HttpException(error.message, 500);
    }
  }

  async update(id: string, updateCompteDto: UpdateCompteDto):Promise<Compte> {
    try {
      return await this.compteModel.findByIdAndUpdate(id, updateCompteDto,{new:true}).populate({path:'etudiant',model:this.etudiantModel});
    } catch (error) {
      throw new HttpException(error.message, 500);
    }
  }

  // async remove(id: string): Promise<Compte> {
  //   try {
  //     const c =  await this.compteModel.findByIdAndDelete(id).populate('etudiant','',this.etudiantModel);
  //      await this.operationService.deleteMany(c._id);
  //     return c;
  //   } catch (error) {
  //     throw new HttpException(error.message, 500);
  //   }
  // }
  async toggleState(id: string, dto: {is_actif: boolean}):Promise<Compte> {
    try {
     return this.compteModel.findByIdAndUpdate(id,dto)
    } catch (error) {
      throw new HttpException(error.message, 500)
    }
   }

  /**
   * Ajoute un montant au solde d'un compte (opération atomique)
   * @param compteId ID du compte
   * @param montant Montant à ajouter
   */
  async ajouterSolde(compteId: string, montant: number): Promise<Compte> {
    try {
      const compte = await this.compteModel.findOneAndUpdate(
        { _id: compteId },
        { $inc: { solde: Number(montant) } },
        { new: true }
      );
      if (!compte) {
        throw new BadRequestException('Compte introuvable');
      }
      return compte;
    } catch (error) {
      throw new HttpException(error.message, 500);
    }
  }

  /**
   * Retire un montant du solde d'un compte (opération atomique avec vérification de solde)
   * @param compteId ID du compte
   * @param montant Montant à retirer
   */
  async retirerSolde(compteId: string, montant: number): Promise<Compte> {
    try {
      // Opération atomique: vérifie que le solde est suffisant ET débite en une seule opération
      const compte = await this.compteModel.findOneAndUpdate(
        { 
          _id: compteId, 
          solde: { $gte: Number(montant) } 
        },
        { $inc: { solde: -Number(montant) } },
        { new: true }
      );
      
      if (!compte) {
        // Vérifier si le compte existe pour différencier "compte introuvable" vs "solde insuffisant"
        const exists = await this.compteModel.exists({ _id: compteId });
        if (!exists) {
          throw new BadRequestException('Compte introuvable');
        }
        throw new BadRequestException(`Solde insuffisant`);
      }

      return compte;
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new HttpException(error.message, 500);
    }
  }

  /**
   * Récupère le solde d'un compte
   * @param compteId ID du compte
   */
  async getSolde(compteId: string): Promise<number> {
    try {
      const compte = await this.compteModel.findById(compteId);
      if (!compte) {
        throw new BadRequestException('Compte introuvable');
      }

      return Number(compte.solde || 0);
    } catch (error) {
      throw new HttpException(error.message, 500);
    }
  }

}
