import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Etudiant, EtudiantDocument } from './entities/etudiant.entity';
import { InscriptionService } from '../inscription/inscription.service';
import { Inscription } from '../inscription/entities/inscription.entity';
import { UpdateEtudiantProfileDto } from './dto/update-etudiant-profile.dto';

@Injectable()
export class EtudiantService {
  constructor(@InjectModel(Etudiant.name,"etudiant") private etudiantModel: Model<EtudiantDocument>, private inscriptionService: InscriptionService){}

  async findAll(): Promise<Etudiant[]> {
  try {
    return await this.etudiantModel.find().sort({createdAt: 1});
  } catch (error) {
    throw new HttpException(error.message, 500);
  }
  }

  async findOne(id: string): Promise<Etudiant> {
    try {
      const r =  await this.etudiantModel.aggregate([
        {
          $match: { _id: new mongoose.Types.ObjectId(id) }
        },
        {
          $addFields: {
            sId: {
              $toString: "$_id"
            }
          }
        },
        {
          $lookup: {
            from: "inscriptions",
            localField: "sId",
            foreignField: "etudiant",
            pipeline:[
              { $addFields: { Ssession: { $toObjectId: "$session" },Sformation: { $toObjectId: "$formation" } } },
         {
          $lookup: {
            from: "sessions",
            localField: "Ssession",
            foreignField: "_id",
            as: "session"
          }
        },
        {
          $lookup: {
            from: "formations",
            localField: "Sformation",
            foreignField: "_id",
            as: "formation"
          }
        },
         { $unwind: { path: "$session", preserveNullAndEmptyArrays: true } },
         { $unwind: { path: "$formation", preserveNullAndEmptyArrays: true } }
            ],
            as: "inscriptions"
          }
        }
      ]);

      return r[0]
    } catch (error) {
      throw new HttpException(error.message, 500);
    }
  }


  async findInscription(id: string): Promise<Inscription> {
    try {
      const ins =  await this.inscriptionService.findOneActiveByEtudiant(id) as any[];
      return ins.length > 0 ? ins[0] : null;
    } catch (error) {
      throw new HttpException(error.message, 500);
    }
  }

  async count(): Promise<number> {
    try {
      return await this.etudiantModel.countDocuments();
    } catch (error) {
      throw new HttpException(error.message, 500);
    }
  }

  async findOneByNce(nce: string): Promise<Etudiant> {
    try {
      return await this.etudiantModel.findById({nce});
    } catch (error) {
      throw new HttpException(error.message, 500);
    }
  }

  async updateProfile(id: string, dto: UpdateEtudiantProfileDto): Promise<Etudiant> {
    try {
      return await this.etudiantModel.findByIdAndUpdate(id, dto);
    } catch (error) {
      throw new HttpException(error.message, 500);
    }
  }

  // async update(id: string, updateEtudiantDto: UpdateEtudiantDto):Promise<Etudiant> {
  //   try {
  //     return await this.etudiantModel.findByIdAndUpdate(id, updateEtudiantDto);
  //   } catch (error) {
  //     throw new HttpException(error.message, 500);
  //   }
  // }

  // async remove(id: string): Promise<Etudiant> {
  //   try {
  //     return await this.etudiantModel.findByIdAndDelete(id);
  //   } catch (error) {
  //     throw new HttpException(error.message, 500);
  //   }
  // }
}
