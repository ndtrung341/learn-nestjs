import { DefaultNamingStrategy, Table } from 'typeorm';
import { snakeCase } from '@utils/string';

export class NamingStrategy extends DefaultNamingStrategy {
   tableName(targetName: string, customName: string | undefined) {
      return customName
         ? customName
         : snakeCase(targetName.replace('Entity', ''));
   }

   columnName(
      propertyName: string,
      customName: string,
      embeddedPrefixes: string[],
   ) {
      const prefix = snakeCase(embeddedPrefixes.concat('').join('_'));
      const name = customName || snakeCase(propertyName);
      return prefix ? `${prefix}${name}` : `${name}`;
   }

   primaryKeyName(tableOrName: Table | string, columnNames: string[]) {
      const tableName = this.getTableName(tableOrName);
      const columnName =
         columnNames.length > 1 ? '_' + columnNames.join('_') : '';
      return `PK_${tableName}${columnName}`;
   }

   foreignKeyName(
      tableOrName: Table | string,
      columnNames: string[],
      referencedTableName?: string,
   ) {
      const tableName = this.getTableName(tableOrName);
      return `FK_${tableName}_${columnNames.join('_')}_${referencedTableName}`;
   }

   uniqueConstraintName(tableOrName: Table | string, columnNames: string[]) {
      const tableName = this.getTableName(tableOrName);
      return `UQ_${tableName}_${columnNames.join('_')}`;
   }

   indexName(tableOrName: Table | string, columnNames: string[]) {
      const tableName = this.getTableName(tableOrName);
      return `IDX_${tableName}_${columnNames.join('_')}`;
   }

   joinTableName(firstTableName: string, secondTableName: string): string {
      return `${firstTableName}_${secondTableName}`;
   }

   joinColumnName(relationName: string, referencedColumnName: string): string {
      return `${relationName}_${referencedColumnName}`;
   }
}
