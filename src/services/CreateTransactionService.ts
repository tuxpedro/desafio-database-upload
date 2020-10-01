import AppError from '../errors/AppError';


import Transaction from '../models/Transaction';
import Category from '../models/Category'

import { getRepository, getCustomRepository } from 'typeorm'
import TransactionsRepository from '../repositories/TransactionsRepository'

interface requestDTO {
  title: string
  value: number
  type: 'income' | 'outcome'
  category: string
}

class CreateTransactionService {

  public async execute({
    title,
    value,
    type,
    category: categoryTitle
  }: requestDTO): Promise<Transaction> {

    const categoryRepository = getRepository(Category)

    let category = await categoryRepository
      .findOne({ where: { title: categoryTitle } })

    if (!category?.title) {
      category = categoryRepository.create({
        title: categoryTitle
      })

      await categoryRepository.save(category)
    }

    const transactionRepository = getCustomRepository(TransactionsRepository)

    const { total } = await transactionRepository.getBalance()

    if (type === 'outcome' && total < value) {
      throw new AppError('there is no balance available', 400)
    }

    const transaction = transactionRepository.create({
      title,
      type,
      value,
      category_id: category.id
    })

    await transactionRepository.save(transaction)

    return transaction
  }
}

export default CreateTransactionService;
