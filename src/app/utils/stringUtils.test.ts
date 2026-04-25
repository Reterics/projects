import { describe, it, expect } from 'vitest';
import { capitalizeFirstLetter, truncateString, slugify } from './stringUtils';

describe('stringUtils', () => {
  describe('capitalizeFirstLetter', () => {
    it('should capitalize the first letter of a string', () => {
      expect(capitalizeFirstLetter('hello')).toBe('Hello');
      expect(capitalizeFirstLetter('world')).toBe('World');
    });

    it('should return empty string when given empty string', () => {
      expect(capitalizeFirstLetter('')).toBe('');
    });

    it('should handle already capitalized strings', () => {
      expect(capitalizeFirstLetter('Hello')).toBe('Hello');
    });

    it('should handle single character strings', () => {
      expect(capitalizeFirstLetter('a')).toBe('A');
    });
  });

  describe('truncateString', () => {
    it('should truncate strings longer than maxLength', () => {
      expect(truncateString('Hello world', 5)).toBe('Hello...');
    });

    it('should not truncate strings shorter than or equal to maxLength', () => {
      expect(truncateString('Hello', 5)).toBe('Hello');
      expect(truncateString('Hi', 5)).toBe('Hi');
    });

    it('should handle empty strings', () => {
      expect(truncateString('', 5)).toBe('');
    });
  });

  describe('slugify', () => {
    it('should convert spaces to hyphens', () => {
      expect(slugify('hello world')).toBe('hello-world');
    });

    it('should convert to lowercase', () => {
      expect(slugify('Hello World')).toBe('hello-world');
    });

    it('should remove special characters', () => {
      expect(slugify('hello@world!')).toBe('helloworld');
    });

    it('should handle multiple spaces', () => {
      expect(slugify('hello  world')).toBe('hello-world');
    });

    it('should handle leading and trailing spaces', () => {
      expect(slugify(' hello world ')).toBe('hello-world');
    });

    it('should handle complex cases', () => {
      expect(slugify('Hello World! This is a Test')).toBe('hello-world-this-is-a-test');
    });
  });
});
