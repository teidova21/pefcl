import { DATABASE_PREFIX } from '@utils/constants';
import { DataTypes, Model, Optional } from 'sequelize';
import { config } from '@utils/server-config';
import { Account, AccountRole, AccountType } from '@typings/Account';
import { sequelize } from '@utils/pool';
import { generateAccountNumber } from '@utils/misc';

export class AccountModel extends Model<
  Account,
  Optional<Account, 'id' | 'number' | 'balance' | 'role'>
> {}

AccountModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    number: {
      type: DataTypes.STRING,
      unique: true,
      defaultValue: generateAccountNumber,
    },
    accountName: {
      type: DataTypes.STRING,
    },
    isDefault: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    ownerIdentifier: {
      type: DataTypes.STRING,
    },
    role: {
      type: DataTypes.STRING,
      defaultValue: AccountRole.Owner,
    },
    balance: {
      type: DataTypes.INTEGER,
      defaultValue: config?.accounts?.startAmount ?? 0,
    },
    type: {
      type: DataTypes.STRING,
      defaultValue: AccountType.Personal,
    },
  },
  { sequelize: sequelize, tableName: DATABASE_PREFIX + 'accounts', paranoid: true },
);
