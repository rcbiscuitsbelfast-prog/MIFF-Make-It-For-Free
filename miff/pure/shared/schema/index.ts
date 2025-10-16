/**
 * Schema Standardization - Ensures consistent schemas across all MIFF modules
 * Addresses schema drift and provides validation and migration capabilities
 */

export * from './SchemaStandardizer';

// Re-export main classes
export { SchemaStandardizer, schemaStandardizer } from './SchemaStandardizer';

// Export types
export type {
  SchemaDefinition,
  SchemaField,
  FieldValidation,
  SchemaValidation,
  SchemaMigration,
  MigrationStep,
  SchemaValidationResult
} from './SchemaStandardizer';