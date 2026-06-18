import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from 'vitest';
import { itemService } from '../../services/item.service.js';

let itemData;
let caughtError;

Given('a file size limit of {int} MB', function (limit) {
  // Assuming the limit is strictly 5MB as per BUSINESS_RULES
});

When('a free user uploads a file of size {int} MB', function (sizeMB) {
  itemData = {
    label: 'Archivo',
    content: {
      fileData: {
        size: sizeMB * 1024 * 1024
      }
    }
  };
  
  try {
    itemService.checkFreeFileSizeLimit(itemData);
  } catch (error) {
    caughtError = error;
  }
});

Then('an error should be thrown with status {int}', function (status) {
  if (!caughtError) {
    throw new Error('Expected an error to be thrown but none was caught.');
  }
  expect(caughtError.statusCode).toEqual(status);
});
