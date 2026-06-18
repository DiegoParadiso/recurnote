import { describe, it, expect } from 'vitest';
import { itemService } from '../../services/item.service.js';

describe('ItemService - extractItemMetadata', () => {
  it('should return nulls if itemData is empty', () => {
    const result = itemService.extractItemMetadata(null);
    expect(result).toEqual({ item_type: null, content_text: null });
  });

  it('should extract item_type and content_text correctly from content.text', () => {
    const itemData = {
      type: 'Note',
      content: { text: 'Hello world' }
    };
    const result = itemService.extractItemMetadata(itemData);
    expect(result).toEqual({ item_type: 'Note', content_text: 'Hello world' });
  });

  it('should extract label and content.title correctly', () => {
    const itemData = {
      label: 'Task',
      content: { title: 'Do laundry', description: 'At 5 PM' }
    };
    const result = itemService.extractItemMetadata(itemData);
    expect(result).toEqual({ item_type: 'Task', content_text: 'Do laundry At 5 PM' });
  });
  
  it('should extract text property directly if content does not match', () => {
    const itemData = {
      type: 'Link',
      text: 'https://example.com'
    };
    const result = itemService.extractItemMetadata(itemData);
    expect(result).toEqual({ item_type: 'Link', content_text: 'https://example.com' });
  });
});
