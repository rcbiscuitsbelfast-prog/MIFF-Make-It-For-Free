/**
 * TypeGuards Test Suite
 * Test the TypeGuards utility class
 */

import { TypeGuards } from './TypeGuards';

describe('TypeGuards', () => {
  let typeGuards: TypeGuards;

  beforeEach(() => {
    typeGuards = TypeGuards?.getInstance();
  });

  test('should create TypeGuards instance', () => {
    expect(typeGuards).toBeDefined();
    expect(typeGuards).toBeInstanceOf(TypeGuards);
  });

  test('should check if value is string', () => {
    expect(TypeGuards?.isString('hello')).toBe(true);
    expect(TypeGuards?.isString(123)).toBe(false);
    expect(TypeGuards?.isString(null)).toBe(false);
    expect(TypeGuards?.isString(undefined)).toBe(false);
  });

  test('should check if value is number', () => {
    expect(TypeGuards?.isNumber(123)).toBe(true);
    expect(TypeGuards?.isNumber('123')).toBe(false);
    expect(TypeGuards?.isNumber(null)).toBe(false);
    expect(TypeGuards?.isNumber(undefined)).toBe(false);
  });

  test('should check if value is boolean', () => {
    expect(TypeGuards?.isBoolean(true)).toBe(true);
    expect(TypeGuards?.isBoolean(false)).toBe(true);
    expect(TypeGuards?.isBoolean('true')).toBe(false);
    expect(TypeGuards?.isBoolean(1)).toBe(false);
  });

  test('should check if value is array', () => {
    expect(TypeGuards?.isArray([1, 2, 3])).toBe(true);
    expect(TypeGuards?.isArray([])).toBe(true);
    expect(TypeGuards?.isArray('hello')).toBe(false);
    expect(TypeGuards?.isArray({})).toBe(false);
  });

  test('should check if value is object', () => {
    expect(TypeGuards?.isObject({})).toBe(true);
    expect(TypeGuards?.isObject({ key: 'value' })).toBe(true);
    expect(TypeGuards?.isObject([])).toBe(false);
    expect(TypeGuards?.isObject(null)).toBe(false);
  });

  test('should check if value is function', () => {
    expect(TypeGuards?.isFunction(() => {})).toBe(true);
    expect(TypeGuards?.isFunction(function() {})).toBe(true);
    expect(TypeGuards?.isFunction('function')).toBe(false);
    expect(TypeGuards?.isFunction({})).toBe(false);
  });

  test('should check if value is null', () => {
    expect(TypeGuards?.isNull(null)).toBe(true);
    expect(TypeGuards?.isNull(undefined)).toBe(false);
    expect(TypeGuards?.isNull('')).toBe(false);
    expect(TypeGuards?.isNull(0)).toBe(false);
  });

  test('should check if value is undefined', () => {
    expect(TypeGuards?.isUndefined(undefined)).toBe(true);
    expect(TypeGuards?.isUndefined(null)).toBe(false);
    expect(TypeGuards?.isUndefined('')).toBe(false);
    expect(TypeGuards?.isUndefined(0)).toBe(false);
  });

  test('should check if value is null or undefined', () => {
    expect(TypeGuards?.isNullOrUndefined(null)).toBe(true);
    expect(TypeGuards?.isNullOrUndefined(undefined)).toBe(true);
    expect(TypeGuards?.isNullOrUndefined('')).toBe(false);
    expect(TypeGuards?.isNullOrUndefined(0)).toBe(false);
  });

  test('should check if value is empty', () => {
    expect(TypeGuards?.isEmpty('')).toBe(true);
    expect(TypeGuards?.isEmpty([])).toBe(true);
    expect(TypeGuards?.isEmpty({})).toBe(true);
    expect(TypeGuards?.isEmpty(null)).toBe(true);
    expect(TypeGuards?.isEmpty(undefined)).toBe(true);
    expect(TypeGuards?.isEmpty('hello')).toBe(false);
    expect(TypeGuards?.isEmpty([1, 2, 3])).toBe(false);
    expect(TypeGuards?.isEmpty({ key: 'value' })).toBe(false);
  });

  test('should check if value is primitive', () => {
    expect(TypeGuards?.isPrimitive('hello')).toBe(true);
    expect(TypeGuards?.isPrimitive(123)).toBe(true);
    expect(TypeGuards?.isPrimitive(true)).toBe(true);
    expect(TypeGuards?.isPrimitive(null)).toBe(true);
    expect(TypeGuards?.isPrimitive(undefined)).toBe(true);
    expect(TypeGuards?.isPrimitive({})).toBe(false);
    expect(TypeGuards?.isPrimitive([])).toBe(false);
    expect(TypeGuards?.isPrimitive(() => {})).toBe(false);
  });
});