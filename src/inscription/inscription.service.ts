import { HttpException, Injectable } from '@nestjs/common';
import { Inscription, InscriptionDocument } from './entities/inscription.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class InscriptionService {
  constructor(@InjectModel(Inscription.name,"etudiant") private inscriptionModel: Model<InscriptionDocument>) {}

  async findOneActiveByEtudiant(id: string): Promise<any> {
    try {
      return await this.inscriptionModel.aggregate([
        {
          $match: {
            etudiant: id,
            active: true
          }
        },
        {
          $addFields:{
            fid: {$toObjectId:"$formation"}
          }
        },
        {
          $lookup: {
            from: "formations",
            localField: "fid",
            foreignField: "_id",
            as: "formation"
          }
        },
        {
          $unwind: "$formation"
        }
      ]);
    } catch (error) {
      throw new HttpException(error.message, 500);
    }
  }
}
