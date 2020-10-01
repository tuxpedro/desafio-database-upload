import { json, Router } from 'express';
import { getRepository, getCustomRepository, Any } from 'typeorm'
import Category from '../models/Category';
import Transaction from '../models/Transaction'
import { isUuid } from 'uuidv4'
import multer from 'multer'
import uploadConfig from '../config/upload'
import path from 'path'
import fs from 'fs'
import readline from 'readline'
import csvParser from 'csv-parse'

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();
const upload = multer(uploadConfig)

transactionsRouter.get('/', async (request, response) => {
  const transactionRepository = getCustomRepository(TransactionsRepository)

  const transactions = await transactionRepository.all()

  const balance = await transactionRepository.getBalance()

  return response.json({ transactions, "balance": balance })
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category: categoryTitle } = request.body

  const createTransaction = new CreateTransactionService()

  const transaction = await createTransaction.execute({
    title,
    value,
    type,
    category: categoryTitle
  })


  return response.json(transaction)

});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params

  const deleteTransactionService = new DeleteTransactionService()

  await deleteTransactionService.execute({ id })

  return response.status(204).json()
});


transactionsRouter.post('/import', upload.single('file'), async (request, response) => {
  const { filename } = request.file
  const filePath = path.join(uploadConfig.directory, filename)

  const importTransactionsService = new ImportTransactionsService()

  const transactions = await importTransactionsService.execute({
    filePath
  })

  return response.json(transactions)

});

export default transactionsRouter;
