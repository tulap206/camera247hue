#!/usr/bin/env node
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const source = readFileSync(
  resolve(import.meta.dirname, '../../app/admin/page.tsx'),
  'utf8',
);

describe('admin post content preservation', () => {
  it('keeps original HTML when editor text is unchanged', () => {
    assert.match(source, /const originalPlainContent = htmlToText\(post\?\.content \|\| ''\)/);
    assert.match(
      source,
      /const contentToSave = post && form\.content === originalPlainContent\s*\?\s*post\.content\s*:\s*textToHtml\(form\.content\)/,
    );
    assert.match(source, /content: contentToSave/);
  });

  it('does not always re-encode form content on save', () => {
    const submitStart = source.indexOf('const handleSubmit = async');
    const submitEnd = source.indexOf('return (', submitStart);
    const submitBody = source.slice(submitStart, submitEnd);

    assert.doesNotMatch(submitBody, /content:\s*textToHtml\(form\.content\)/);
  });
});
