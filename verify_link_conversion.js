
import { htmlToMarkdown } from './frontend/src/utils/markdownConverter.js';
import { JSDOM } from 'jsdom';

// Mock DOM environment for htmlToMarkdown
const dom = new JSDOM('<!DOCTYPE html><body></body>');
global.document = dom.window.document;
global.Node = dom.window.Node;

const testHtml = 'Some <a href="https://example.com">link</a> text.';
const expectedMarkdown = 'Some [link](https://example.com) text.';

const result = htmlToMarkdown(testHtml);

console.log('Input HTML:', testHtml);
console.log('Result Markdown:', result);
console.log('Expected:', expectedMarkdown);

if (result.trim() === expectedMarkdown) {
    console.log('PASS');
} else {
    console.log('FAIL');
}
