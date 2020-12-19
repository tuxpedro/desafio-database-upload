import { EntityRepository, getRepository, Repository } from 'typeorm';
import Category from '../models/Category';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {

  public async all(): Promise<Transaction[]> {
    return await this.find()
  }

  public async getBalance(): Promise<Balance> {
    const allTransactions = await this.find()

    const calculateBalance = (balance: Balance, transaction: Transaction): Balance => {
      const { type, value } = transaction
      balance[type] += Number(value)
      balance['total'] = balance['income'] - balance['outcome']
      return balance
    }
    return allTransactions.reduce(calculateBalance, { income: 0, outcome: 0, total: 0 })

  }
}

export default TransactionsRepository;
