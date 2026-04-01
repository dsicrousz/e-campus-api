import {
  PureAbility,
  AbilityBuilder,
  AbilityClass,
  ExtractSubjectType,
  InferSubjects,
  mongoQueryMatcher,
} from '@casl/ability';
import { Injectable } from '@nestjs/common';
import { Compte } from '../compte/entities/compte.entity';
import { Service } from '../service/entities/service.entity';
import { Operation } from '../operation/entities/operation.entity';
import { Session } from '../session/entities/session.entity';
import { User } from 'src/user/entities/user.entity';

export enum Action {
  Manage = 'manage',
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
}

export enum USER_ROLE {
  SUPERADMIN = 'superadmin',
  ADMIN = 'admin',
  CONTROLEUR = 'controleur',
  REPREUNEUR = 'repreuneur',
  VENDEUR = 'vendeur',
  CAISSIER = 'caissier',
}

export type Subjects = InferSubjects<typeof Compte | typeof Service | typeof Operation | typeof Session | 'all'>;

export type AppAbility = PureAbility<[Action, Subjects]>;

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: User) {
    const { can,cannot, build } = new AbilityBuilder<PureAbility<[Action, Subjects]>>(
      PureAbility as AbilityClass<AppAbility>,
    );

    if (user.role.includes(USER_ROLE.SUPERADMIN)) {
      can(Action.Manage, 'all'); // read-write access to everything
    }
    else if(user.role.includes(USER_ROLE.ADMIN)) {
      // Les permissions utilisateur sont gérées par Better Auth
      can(Action.Read, Compte);
      can(Action.Create, Compte);
      can(Action.Update, Compte);
      cannot(Action.Delete, Compte);
      can(Action.Read, Operation);
      can(Action.Create, Operation);
      can(Action.Update, Operation);
      can(Action.Delete, Operation);
      can(Action.Read, Session);
      can(Action.Create, Session);
      can(Action.Update, Session);
      can(Action.Delete, Session);
    }
    else if(user.role.includes(USER_ROLE.CONTROLEUR)) {
      // Les permissions utilisateur sont gérées par Better Auth
      can(Action.Read, Service);
      can(Action.Read, Operation);
      can(Action.Create, Operation);
      can(Action.Read, Session);
    }
    else if(user.role.includes(USER_ROLE.REPREUNEUR)) {
      // Les permissions utilisateur sont gérées par Better Auth
      can(Action.Read, Service);
      can(Action.Read, Operation);
      can(Action.Read, Session);
    }
    else if(user.role.includes(USER_ROLE.VENDEUR)) {
      // Les permissions utilisateur sont gérées par Better Auth
      can(Action.Read, Operation);
      can(Action.Create, Operation);
      can(Action.Read, Session);
    }
     else {
      can(Action.Read, Compte);
      cannot(Action.Delete, Compte);
      cannot(Action.Update, Compte);
      // Les permissions utilisateur sont gérées par Better Auth
    }

    return build({
      conditionsMatcher: mongoQueryMatcher,
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
    });
  }
}
