import AppError from '../errors/AppError'
import Transaction from '../models/Transaction';

import fs from 'fs'
import csvParse from 'csv-parse'
import { getCustomRepository, getRepository, In } from 'typeorm';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface requestDTO {
  filePath: string
}

interface CSVTransactions {
  title: string
  type: 'income' | 'outcome'
  value: number
  category: string
}

class ImportTransactionsService {
  async execute({ filePath }: requestDTO): Promise<Transaction[]> {

    const fileExists = await fs.promises.stat(filePath)

    if (!fileExists) {
      throw new AppError('file does not exist or was not loaded correctly')
    }

    const readCsvFile = fs.createReadStream(filePath)

    const parseCsvFile = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true
    })

    const parseCsvFileStream = readCsvFile.pipe(parseCsvFile)

    const transactions: CSVTransactions[] = [];
    const categories: string[] = []

    parseCsvFileStream.on('data', async record => {

      const [title, type, value, category] = record.map((item: string) =>
        item.trim()
      )

      if (!title || !type || !value) {
        throw new Error('transaction is missing data')
      }

      categories.push(category)
      transactions.push({ title, type, value, category })

    })

    await new Promise(resolve => parseCsvFileStream.on('end', resolve))

    const categoriesRepository = getRepository(Category)

    const existentCategories = await categoriesRepository.find({
      where: {
        title: In(categories)
      }
    })

    const existentCategoriesTitles = existentCategories.map(
      (category: Category) => category.title
    )

    const addCategoriesTitles = categories
      .filter(category => !existentCategoriesTitles.includes(category))
      .filter((category, index, self) => self.indexOf(category) === index)

    const newCaegories = categoriesRepository.create(
      addCategoriesTitles.map(title => ({
        title,
      })),
    )

    await categoriesRepository.save(newCaegories)

    const allCategories = [...newCaegories, ...existentCategories]

    const transactionRepository = getCustomRepository(TransactionsRepository)

    const getCategoryId = (categoryTitle: string, categories: Category[]) =>
      categories
        .filter(({ title }) => title === categoryTitle)
        .reduce((id, category) => id = category.id, '')

    const createdTransactions = transactionRepository.create(
      transactions.map(({ title, type, value, category }) => ({
        title,
        type,
        value,
        category_id: getCategoryId(category, allCategories)
      }))
    )

    await transactionRepository.save(createdTransactions)

    await fs.promises.unlink(filePath)

    return createdTransactions

  }
}

export default ImportTransactionsService;
