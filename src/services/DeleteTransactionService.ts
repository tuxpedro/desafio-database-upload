import AppError from '../errors/AppError';

import { isUuid } from 'uuidv4'
import { getRepository } from 'typeorm'

import Transaction from '../models/Transaction'

interface requestDTO {
  id: string
}

class DeleteTransactionService {
  public async execute({ id }: requestDTO): Promise<void> {

    if (!isUuid(id)) {
      throw new AppError('invalid parameter, check past data', 400)
    }

    const transactionRepository = getRepository(Transaction)
    const transaction = await transactionRepository.findOne({ where: { id } })

    if (!transaction?.id) {
      throw new AppError('transaction not found', 400)
    }

    await transactionRepository.delete(transaction.id)

  }
}

export default DeleteTransactionService;
