/**
 * Schemas Golden Tests
 *
 * Comprehensive tests for the Schemas validation system.
 * Tests cover basic validation, complex schemas, error handling, and edge cases.
 */

import * as fs from 'fs';
import * as path from 'path';
import { SchemaValidator, SchemaDefinition, FieldDefinition, SchemaUtils } from '../index';

describe('Schemas Golden Tests', () => {
  const tempDir = './temp_schemas_test';

  beforeAll(() => {
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }
  });

  afterAll(() => {
    // Cleanup temp files
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  beforeEach(() => {
    // Clean temp directory
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
      fs.mkdirSync(tempDir);
    }
  });

  describe('Basic Schema Validation', () => {
    test('should validate simple required fields', () => {
      const schema: SchemaDefinition = {
        required: ['id', 'name'],
        properties: {
          id: { type: 'string', required: true },
          name: { type: 'string', required: true },
          age: { type: 'number', required: false }
        }
      };

      // Valid data
      const validData = { id: 'test123', name: 'Test User', age: 25 };
      const validResult = SchemaValidator.validateData(validData, schema);
      expect(validResult.isValid).toBe(true);
      expect(validResult.errors).toEqual([]);
      expect(validResult.warnings).toEqual([]);

      // Invalid data - missing required field
      const invalidData1 = { id: 'test123' }; // Missing name
      const invalidResult1 = SchemaValidator.validateData(invalidData1, schema);
      expect(invalidResult1.isValid).toBe(false);
      expect(invalidResult1.errors).toContain('missing required field: name');

      // Invalid data - wrong type
      const invalidData2 = { id: 'test123', name: 'Test User', age: 'not_a_number' };
      const invalidResult2 = SchemaValidator.validateData(invalidData2, schema);
      expect(invalidResult2.isValid).toBe(false);
      expect(invalidResult2.errors).toContain("field 'age' should be number, got string");
    });

    test('should handle empty schema', () => {
      const emptySchema: SchemaDefinition = {};
      const data = { any: 'data' };

      const result = SchemaValidator.validateData(data, emptySchema);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    test('should handle schema with no properties', () => {
      const schema: SchemaDefinition = { required: ['id'] };
      const validData = { id: 'test' };
      const invalidData = {};

      const validResult = SchemaValidator.validateData(validData, schema);
      expect(validResult.isValid).toBe(true);

      const invalidResult = SchemaValidator.validateData(invalidData, schema);
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.errors).toContain('missing required field: id');
    });
  });

  describe('Type Validation', () => {
    test('should validate string types', () => {
      const schema: SchemaDefinition = {
        properties: {
          name: { type: 'string', required: true },
          description: { type: 'string', required: false }
        }
      };

      // Valid strings
      const validResult1 = SchemaValidator.validateData({ name: 'Test' }, schema);
      expect(validResult1.isValid).toBe(true);

      // Invalid non-strings
      const invalidResult1 = SchemaValidator.validateData({ name: 123 }, schema);
      expect(invalidResult1.isValid).toBe(false);
      expect(invalidResult1.errors).toContain("field 'name' should be string, got number");

      const invalidResult2 = SchemaValidator.validateData({ name: null }, schema);
      expect(invalidResult2.isValid).toBe(false);
      expect(invalidResult2.errors).toContain("field 'name' should be string, got object");
    });

    test('should validate number types', () => {
      const schema: SchemaDefinition = {
        properties: {
          age: { type: 'number', required: true },
          score: { type: 'number', required: false }
        }
      };

      // Valid numbers
      const validResult1 = SchemaValidator.validateData({ age: 25 }, schema);
      expect(validResult1.isValid).toBe(true);

      const validResult2 = SchemaValidator.validateData({ age: 25.5 }, schema);
      expect(validResult2.isValid).toBe(true);

      // Invalid non-numbers
      const invalidResult1 = SchemaValidator.validateData({ age: 'twenty-five' }, schema);
      expect(invalidResult1.isValid).toBe(false);
      expect(invalidResult1.errors).toContain("field 'age' should be number, got string");

      const invalidResult2 = SchemaValidator.validateData({ age: NaN }, schema);
      expect(invalidResult2.isValid).toBe(false);
      expect(invalidResult2.errors).toContain("field 'age' should be number, got number");
    });

    test('should validate boolean types', () => {
      const schema: SchemaDefinition = {
        properties: {
          enabled: { type: 'boolean', required: true },
          visible: { type: 'boolean', required: false }
        }
      };

      // Valid booleans
      const validResult1 = SchemaValidator.validateData({ enabled: true }, schema);
      expect(validResult1.isValid).toBe(true);

      const validResult2 = SchemaValidator.validateData({ enabled: false }, schema);
      expect(validResult2.isValid).toBe(true);

      // Invalid non-booleans
      const invalidResult1 = SchemaValidator.validateData({ enabled: 'true' }, schema);
      expect(invalidResult1.isValid).toBe(false);
      expect(invalidResult1.errors).toContain("field 'enabled' should be boolean, got string");

      const invalidResult2 = SchemaValidator.validateData({ enabled: 1 }, schema);
      expect(invalidResult2.isValid).toBe(false);
      expect(invalidResult2.errors).toContain("field 'enabled' should be boolean, got number");
    });
  });

  describe('Object Type Validation', () => {
    test('should validate nested object structures', () => {
      const schema: SchemaDefinition = {
        properties: {
          player: {
            type: 'object',
            required: true,
            properties: {
              id: { type: 'string', required: true },
              stats: {
                type: 'object',
                required: true,
                properties: {
                  health: { type: 'number', required: true },
                  mana: { type: 'number', required: true }
                }
              }
            }
          }
        }
      };

      // Valid nested object
      const validData = {
        player: {
          id: 'hero123',
          stats: {
            health: 100,
            mana: 50
          }
        }
      };
      const validResult = SchemaValidator.validateData(validData, schema);
      expect(validResult.isValid).toBe(true);

      // Invalid nested object - missing required field
      const invalidData1 = {
        player: {
          id: 'hero123'
          // Missing stats
        }
      };
      const invalidResult1 = SchemaValidator.validateData(invalidData1, schema);
      expect(invalidResult1.isValid).toBe(false);
      expect(invalidResult1.errors).toContain('missing required property: player.stats');

      // Invalid nested object - wrong type in nested field
      const invalidData2 = {
        player: {
          id: 'hero123',
          stats: {
            health: 'not_a_number',
            mana: 50
          }
        }
      };
      const invalidResult2 = SchemaValidator.validateData(invalidData2, schema);
      expect(invalidResult2.isValid).toBe(false);
      expect(invalidResult2.errors).toContain("field 'player.stats.health' should be number, got string");
    });

    test('should handle optional object properties', () => {
      const schema: SchemaDefinition = {
        properties: {
          config: {
            type: 'object',
            required: false,
            properties: {
              setting1: { type: 'string', required: true },
              setting2: { type: 'number', required: false }
            }
          }
        }
      };

      // Valid without optional object
      const validResult1 = SchemaValidator.validateData({}, schema);
      expect(validResult1.isValid).toBe(true);

      // Valid with partial object
      const validResult2 = SchemaValidator.validateData({
        config: { setting1: 'value1' }
      }, schema);
      expect(validResult2.isValid).toBe(true);

      // Invalid with missing required property in object
      const invalidResult = SchemaValidator.validateData({
        config: { setting2: 42 } // Missing setting1
      }, schema);
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.errors).toContain('missing required property: config.setting1');
    });
  });

  describe('Array Type Validation', () => {
    test('should validate array structures', () => {
      const schema: SchemaDefinition = {
        properties: {
          items: {
            type: 'array',
            required: true,
            items: { type: 'string' }
          }
        }
      };

      // Valid array
      const validData = { items: ['item1', 'item2', 'item3'] };
      const validResult = SchemaValidator.validateData(validData, schema);
      expect(validResult.isValid).toBe(true);

      // Invalid array with wrong item type
      const invalidData = { items: ['item1', 123, 'item3'] };
      const invalidResult = SchemaValidator.validateData(invalidData, schema);
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.errors).toContain("field 'items[1]' should be string, got number");

      // Invalid non-array
      const invalidData2 = { items: 'not_an_array' };
      const invalidResult2 = SchemaValidator.validateData(invalidData2, schema);
      expect(invalidResult2.isValid).toBe(false);
      expect(invalidResult2.errors).toContain("field 'items' should be array, got string");
    });

    test('should validate array of objects', () => {
      const schema: SchemaDefinition = {
        properties: {
          inventory: {
            type: 'array',
            required: true,
            items: {
              type: 'object',
              properties: {
                id: { type: 'string', required: true },
                quantity: { type: 'number', required: true }
              }
            }
          }
        }
      };

      // Valid array of objects
      const validData = {
        inventory: [
          { id: 'sword', quantity: 1 },
          { id: 'potion', quantity: 5 }
        ]
      };
      const validResult = SchemaValidator.validateData(validData, schema);
      expect(validResult.isValid).toBe(true);

      // Invalid array with wrong object structure
      const invalidData = {
        inventory: [
          { id: 'sword', quantity: 1 },
          { id: 'invalid' } // Missing quantity
        ]
      };
      const invalidResult = SchemaValidator.validateData(invalidData, schema);
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.errors).toContain('missing required property: inventory[1].quantity');
    });
  });

  describe('File-Based Validation', () => {
    test('should validate files successfully', () => {
      const schemaPath = path.join(tempDir, 'test_schema.json');
      const validDataPath = path.join(tempDir, 'valid_data.json');
      const invalidDataPath = path.join(tempDir, 'invalid_data.json');

      // Create schema
      const schema: SchemaDefinition = {
        required: ['id', 'name'],
        properties: {
          id: { type: 'string', required: true },
          name: { type: 'string', required: true },
          age: { type: 'number', required: false }
        }
      };

      fs.writeFileSync(schemaPath, JSON.stringify(schema, null, 2));

      // Valid data
      fs.writeFileSync(validDataPath, JSON.stringify({
        id: 'test123',
        name: 'Test User',
        age: 25
      }, null, 2));

      // Invalid data
      fs.writeFileSync(invalidDataPath, JSON.stringify({
        id: 'test456'
        // Missing name
      }, null, 2));

      // Test validation
      const validResult = SchemaValidator.validate(schemaPath, validDataPath);
      expect(validResult.isValid).toBe(true);

      const invalidResult = SchemaValidator.validate(schemaPath, invalidDataPath);
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.errors).toContain('missing required field: name');
    });

    test('should handle file not found errors', () => {
      const result1 = SchemaValidator.validate('nonexistent_schema.json', 'nonexistent_data.json');
      expect(result1.isValid).toBe(false);
      expect(result1.errors).toContain('Schema file not found: nonexistent_schema.json');

      // Create a schema file but missing data file
      const schemaPath = path.join(tempDir, 'existing_schema.json');
      fs.writeFileSync(schemaPath, JSON.stringify({ required: ['id'] }, null, 2));

      const result2 = SchemaValidator.validate(schemaPath, 'nonexistent_data.json');
      expect(result2.isValid).toBe(false);
      expect(result2.errors).toContain('JSON file not found: nonexistent_data.json');
    });
  });

  describe('Schema Management', () => {
    test('should load and save schemas correctly', () => {
      const schemaPath = path.join(tempDir, 'test_schema.json');

      const originalSchema: SchemaDefinition = {
        title: 'Test Schema',
        description: 'Schema for testing',
        required: ['id', 'name'],
        properties: {
          id: { type: 'string', required: true },
          name: { type: 'string', required: true }
        }
      };

      // Save schema
      const saveSuccess = SchemaValidator.saveSchema(schemaPath, originalSchema);
      expect(saveSuccess).toBe(true);

      // Load schema
      const loadedSchema = SchemaValidator.loadSchema(schemaPath);
      expect(loadedSchema).toEqual(originalSchema);
    });

    test('should create schemas with utility functions', () => {
      const schema = SchemaValidator.createSchema(
        ['id', 'name'],
        {
          id: SchemaUtils.stringField(true),
          name: SchemaUtils.stringField(true),
          age: SchemaUtils.numberField(false),
          settings: SchemaUtils.objectField({
            volume: SchemaUtils.numberField(false),
            quality: SchemaUtils.stringField(false)
          }, false)
        }
      );

      expect(schema.required).toEqual(['id', 'name']);
      expect(schema.properties?.id.type).toBe('string');
      expect(schema.properties?.age.type).toBe('number');
      expect(schema.properties?.settings.type).toBe('object');
    });
  });

  describe('Batch Validation', () => {
    test('should validate multiple files', () => {
      const schemaPath = path.join(tempDir, 'batch_schema.json');
      const dataPaths = [
        path.join(tempDir, 'data1.json'),
        path.join(tempDir, 'data2.json'),
        path.join(tempDir, 'data3.json')
      ];

      // Create schema
      const schema: SchemaDefinition = {
        required: ['id'],
        properties: { id: { type: 'string', required: true } }
      };
      fs.writeFileSync(schemaPath, JSON.stringify(schema, null, 2));

      // Create test data
      fs.writeFileSync(dataPaths[0], JSON.stringify({ id: 'valid1' }, null, 2));
      fs.writeFileSync(dataPaths[1], JSON.stringify({ id: 'valid2' }, null, 2));
      fs.writeFileSync(dataPaths[2], JSON.stringify({ name: 'invalid' }, null, 2)); // Missing id

      // Batch validate
      const result = SchemaValidator.validateBatch(schemaPath, dataPaths);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Validation failed for ' + dataPaths[2] + ':');
      expect(result.errors.some(error => error.includes('missing required field: id')));
    });
  });

  describe('Error Handling', () => {
    test('should handle malformed JSON gracefully', () => {
      const schemaPath = path.join(tempDir, 'malformed_schema.json');
      const dataPath = path.join(tempDir, 'malformed_data.json');

      fs.writeFileSync(schemaPath, '{ invalid json }');
      fs.writeFileSync(dataPath, '{ also invalid }');

      const result = SchemaValidator.validate(schemaPath, dataPath);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.startsWith('Validation error:')));
    });

    test('should handle null and undefined values', () => {
      const schema: SchemaDefinition = {
        properties: {
          str: { type: 'string', required: false },
          num: { type: 'number', required: false },
          bool: { type: 'boolean', required: false }
        }
      };

      const result = SchemaValidator.validateData({
        str: null,
        num: undefined,
        bool: null
      }, schema);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("field 'str' should be string, got object");
      expect(result.errors).toContain("field 'num' should be number, got undefined");
      expect(result.errors).toContain("field 'bool' should be boolean, got object");
    });
  });

  describe('Performance', () => {
    test('should handle large schemas efficiently', () => {
      // Create a large schema
      const largeSchema: SchemaDefinition = { required: [], properties: {} };

      for (let i = 0; i < 1000; i++) {
        largeSchema.properties![`field${i}`] = { type: 'string', required: false };
      }

      // Create corresponding data
      const largeData: any = {};
      for (let i = 0; i < 1000; i++) {
        largeData[`field${i}`] = `value${i}`;
      }

      const startTime = Date.now();
      const result = SchemaValidator.validateData(largeData, largeSchema);
      const endTime = Date.now();

      expect(result.isValid).toBe(true);
      expect(endTime - startTime).toBeLessThan(100); // Should complete in < 100ms
    });

    test('should handle deeply nested structures', () => {
      const nestedSchema: SchemaDefinition = {
        properties: {
          level1: {
            type: 'object',
            properties: {
              level2: {
                type: 'object',
                properties: {
                  level3: {
                    type: 'object',
                    properties: {
                      level4: {
                        type: 'object',
                        properties: {
                          level5: {
                            type: 'object',
                            properties: {
                              value: { type: 'string', required: true }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      };

      const nestedData = {
        level1: {
          level2: {
            level3: {
              level4: {
                level5: {
                  value: 'deep value'
                }
              }
            }
          }
        }
      };

      const result = SchemaValidator.validateData(nestedData, nestedSchema);
      expect(result.isValid).toBe(true);
    });
  });
});