import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

class CreateTablesTransactionsAndCategories1601322288995 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    await queryRunner.createTable(new Table({
      name: 'transactions',
      columns: [
        {
          name: 'id',
          type: 'uuid',
          isPrimary: true,
          generationStrategy: 'uuid',
          default: `uuid_generate_v4()`
        },
        {
          name: 'title',
          type: 'varchar'
        },
        {
          name: 'type',
          type: 'varchar',
        },
        {
          name: 'value',
          type: 'decimal(12,2)',
        },
        {
          name: 'category_id',
          type: 'uuid'
        },
        {
          name: 'created_at',
          type: 'timestamp',
          default: 'now()'
        },
        {
          name: 'updated_at',
          type: 'timestamp',
          default: 'now()'
        }
      ]
    }))
    await queryRunner.createTable(new Table({
      name: 'categories',
      columns: [
        {
          name: 'id',
          type: 'uuid',
          isPrimary: true,
          generationStrategy: 'uuid',
          default: `uuid_generate_v4()`
        },
        {
          name: 'title',
          type: 'varchar',
          isUnique: true
        },
        {
          name: 'created_at',
          type: 'timestamp',
          default: 'now()'
        },
        {
          name: 'updated_at',
          type: 'timestamp',
          default: 'now()'
        }
      ]
    }))


    await queryRunner.createForeignKey('transactions', new TableForeignKey({
      name: 'category_id_FK',
      columnNames: ['category_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'categories',
      onDelete: 'NO ACTION',
      onUpdate: 'NO ACTION'
    }))

  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('transactions', 'category_id_FK')
    await queryRunner.dropTable('categories')
    await queryRunner.dropTable('transactions')
  }

}

export default CreateTablesTransactionsAndCategories1601322288995
