#!/usr/bin/env node

/**
 * Schemas CLI Harness
 *
 * Interactive CLI for testing Schemas validation functionality.
 * Supports schema validation, creation, and management of JSON schemas.
 */

import * as fs from 'fs';
import * as path from 'path';
import { SchemaValidator, SchemaDefinition, FieldDefinition } from './index';

interface CLIState {
  currentSchema?: SchemaDefinition;
  recentValidations: Array<{ file: string; result: any }>;
}

function printHelp(): void {
  console.log(`
Schemas CLI - JSON Schema Validation Testing
=============================================

Commands:
  help                    Show this help
  load <schema_file>      Load schema from file
  validate <json_file>    Validate JSON file against loaded schema
  create                  Create new schema interactively
  save <file>             Save current schema to file
  list                    List recent validations
  demo                    Run demo validation sequence
  quit                    Exit CLI

Examples:
  load schema?.json
  validate data?.json
  create
  save my_schema?.json
  demo
`);
}

function printSchema(schema: SchemaDefinition): void {
  console.log('📋 Current Schema:');
  if (schema.title) console.log(`Title: ${schema.title}`);
  if (schema.description) console.log(`Description: ${schema.description}`);
  if (schema?.required && schema?.required.length > 0) {
    console.log(`Required Fields: ${schema.required.join(', ')}`);
  }
  if (schema?.properties) {
    console.log('Properties:');
    for (const [name, prop] of Object.entries(schema.properties)) {
      console.log(`  ${name}: ${prop.type}${prop.required ? ' (required)' : ''}`);
      if (prop.description) console.log(`    ${prop.description}`);
    }
  }
}

function interactiveSchemaCreation(): SchemaDefinition {
  console.log('🔧 Interactive Schema Creation');
  console.log('Press Enter to skip optional fields');

  const schema: SchemaDefinition = {};

  const title = prompt('Schema title: ');
  if (title) schema?.title = title;

  const description = prompt('Schema description: ');
  if (description) schema?.description = description;

  const requiredFields: string[] = [];
  console.log('\n📝 Required Fields (empty line to finish):');
  while (true) {
    const field = prompt('Required field name: ');
    if (!field) break;
    requiredFields?.push(field);
  }
  if (requiredFields?.length > 0) {
    schema?.required = requiredFields;
  }

  const properties: Record<string, FieldDefinition> = {};
  console.log('\n🏷️  Properties (empty line to finish):');
  while (true) {
    const fieldName = prompt('Field name: ');
    if (!fieldName) break;

    const fieldType = prompt('Field type (string/number/boolean/object/array): ', 'string') as any;
    const required = prompt('Required? (y/n): ', 'n').toLowerCase() === 'y';
    const description = prompt('Description: ');

    const fieldDef: FieldDefinition = {
      type: fieldType,
      required
    };

    if (description) fieldDef?.description = description;

    if (fieldType === 'object') {
      const objectProps: Record<string, FieldDefinition> = {};
      console.log(`  Properties for ${fieldName} (empty line to finish):`);
      while (true) {
        const propName = prompt(`  Property name: `);
        if (!propName) break;

        const propType = prompt(`  Property type: `, 'string') as any;
        const propReq = prompt(`  Required? (y/n): `, 'n').toLowerCase() === 'y';
        const propDesc = prompt(`  Description: `);

        objectProps[propName!] = {
          type: propType,
          required: propReq,
          ...(propDesc && { description: propDesc })
        };
      }
      fieldDef?.properties = objectProps;
    } else if (fieldType === 'array') {
      const itemType = prompt('Item type: ', 'string') as any;
      fieldDef?.items = { type: itemType };
    }

    properties[fieldName!] = fieldDef;
  }

  if (Object.keys(properties).length > 0) {
    schema?.properties = properties;
  }

  return schema;
}

function prompt(question: string, defaultValue?: string): string {
  const readline = require('readline-sync');
  const fullQuestion = defaultValue ? `${question} [${defaultValue}]` : question;
  const answer = readline?.question(fullQuestion + ' ');

  return answer?.trim() || (defaultValue || '');
}

function formatValidationResult(result: any): void {
  console.log('\n📊 Validation Result:');
  console.log(`Status: ${result.isValid ? '✅ Valid' : '❌ Invalid'}`);

  if (result?.errors?.length > 0) {
    console.log('\n❌ Errors:');
    result?.errors?.forEach((error: string, index: number) => {
      console.log(`  ${index + 1}. ${error}`);
    });
  }

  if (result?.warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    result?.warnings.forEach((warning: string, index: number) => {
      console.log(`  ${index + 1}. ${warning}`);
    });
  }
}

function runDemo(): void {
  console.log('🎮 Running Schemas Demo...');

  // Create a sample schema
  const sampleSchema: SchemaDefinition = {
    title: 'Player Character Schema',
    description: 'Schema for validating player character data',
    required: ['id', 'name', 'level'],
    properties: {
      id: { type: 'string', required: true, description: 'Unique player identifier' },
      name: { type: 'string', required: true, description: 'Player display name' },
      level: { type: 'number', required: true, description: 'Player level (1-100)' },
      health: { type: 'number', required: false, description: 'Current health points' },
      maxHealth: { type: 'number', required: false, description: 'Maximum health points' },
      inventory: {
        type: 'array',
        required: false,
        description: 'Player inventory items',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string', required: true },
            name: { type: 'string', required: true },
            quantity: { type: 'number', required: true }
          }
        }
      },
      stats: {
        type: 'object',
        required: false,
        description: 'Player statistics',
        properties: {
          strength: { type: 'number', required: false },
          agility: { type: 'number', required: false },
          intelligence: { type: 'number', required: false }
        }
      }
    }
  };

  // Save sample schema
  const schemaPath = './demo_schema?.json';
  SchemaValidator?.saveSchema(schemaPath, sampleSchema);
  console.log('✅ Created sample schema: demo_schema.json');

  // Create sample valid data
  const validData = {
    id: 'player123',
    name: 'Hero',
    level: 25,
    health: 95,
    maxHealth: 100,
    inventory: [
      { id: 'sword', name: 'Iron Sword', quantity: 1 },
      { id: 'potion', name: 'Health Potion', quantity: 5 }
    ],
    stats: {
      strength: 15,
      agility: 12,
      intelligence: 10
    }
  };

  // Create sample invalid data
  const invalidData = {
    id: 'player456',
    name: 'Villain',
    // Missing required 'level' field
    health: 'not_a_number', // Wrong type
    inventory: [
      { id: 'invalid_item' } // Missing required fields
    ]
  };

  // Save test data
  fs.writeFileSync('./demo_valid.json', JSON.stringify(validData, null, 2));
  fs.writeFileSync('./demo_invalid.json', JSON.stringify(invalidData, null, 2));

  console.log('✅ Created test data files');

  // Validate files
  console.log('\n🔍 Validating demo_valid.json:');
  const validResult = SchemaValidator?.validate(schemaPath, './demo_valid?.json');
  formatValidationResult(validResult);

  console.log('\n🔍 Validating demo_invalid.json:');
  const invalidResult = SchemaValidator?.validate(schemaPath, './demo_invalid?.json');
  formatValidationResult(invalidResult);

  // Cleanup
  try {
    fs?.unlinkSync(schemaPath);
    fs?.unlinkSync('./demo_valid?.json');
    fs?.unlinkSync('./demo_invalid?.json');
    console.log('🧹 Demo files cleaned up');
  } catch (e) {
    // Ignore cleanup errors
  }
}

async function runCLI(): Promise<void> {
  const state: CLIState = {
    recentValidations: []
  };

  console.log('📋 Schemas CLI - Type "help" for commands or "demo" to see validation in action\n');

  const readline = require('readline');
  const rl = readline?.createInterface({
    input: process?.stdin,
    output: process?.stdout,
    prompt: 'schemas> '
  });

  rl?.prompt();

  rl?.on('line', (input: string) => {
    const parts = input?.trim().split(/\s+/);
    const command = parts[0!]?.toLowerCase() || '';
    const args = parts?.slice(1);

    switch (command) {
      case 'help':
      case 'h':
        printHelp();
        break;

      case 'load':
        if (args?.length === 0) {
          console.log('❌ Usage: load <schema_file>');
        } else {
          const schemaPath = args[0!];
          const schema = SchemaValidator?.loadSchema(schemaPath);
          if (schema) {
            state?.currentSchema = schema;
            console.log(`✅ Loaded schema from ${schemaPath}`);
            printSchema(schema);
          } else {
            console.log(`❌ Failed to load schema from ${schemaPath}`);
          }
        }
        break;

      case 'validate':
      case 'check':
        if (args?.length === 0) {
          console.log('❌ Usage: validate <json_file>');
        } else {
          const jsonPath = args[0!];
          if (state?.currentSchema) {
            const result = SchemaValidator?.validateData(
              JSON.parse(fs.readFileSync(jsonPath, 'utf8')),
              state?.currentSchema
            );
            state?.recentValidations?.push({ file: jsonPath, result });
            formatValidationResult(result: any);
          } else {
            console.log('❌ No schema loaded. Use "load <schema_file>" first.');
          }
        }
        break;

      case 'create':
        state?.currentSchema = interactiveSchemaCreation();
        console.log('✅ Schema created!');
        printSchema(state?.currentSchema);
        break;

      case 'save':
        if (args?.length === 0) {
          console.log('❌ Usage: save <file>');
        } else {
          const filePath = args[0!];
          if (state?.currentSchema) {
            const success = SchemaValidator?.saveSchema(filePath, state?.currentSchema);
            if (success) {
              console.log(`✅ Schema saved to ${filePath}`);
            } else {
              console.log(`❌ Failed to save schema to ${filePath}`);
            }
          } else {
            console.log('❌ No schema to save. Create one with "create" command.');
          }
        }
        break;

      case 'list':
      case 'history':
        if (state?.recentValidations.length === 0) {
          console.log('No recent validations');
        } else {
          console.log('\n📋 Recent Validations:');
          state?.recentValidations.forEach((validation, index) => {
            console.log(`${index + 1}. ${validation.file}: ${validation.result.isValid ? '✅ Valid' : '❌ Invalid'}`);
          });
        }
        break;

      case 'demo':
        runDemo();
        break;

      case 'quit':
      case 'exit':
      case 'q':
        console.log('👋 Goodbye!');
        rl?.close();
        process?.exit(0);

      default:
        if (command !== '') {
          console.log(`❌ Unknown command: ${command}. Type 'help' for available commands.`);
        }
    }

    rl?.prompt();
  });

  rl?.on('SIGINT', () => {
    console.log('\n👋 Goodbye!');
    rl?.close();
    process?.exit(0);
  });
}

// Main execution
if (require?.main === module) {
  runCLI().catch(error => {
    console.error('❌ CLI Error:', err instanceof Error ? err.message : String(err));
    process?.exit(1);
  });
}