import test from 'ava';
import path from 'path';
import changelog from './helpers/changelog.js';

import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = dirname(fileURLToPath(import.meta.url));

const COMMIT_HASH_LENGTH = 7;

test.serial(
  'Include only commits with "changelog" set to "true"',
  async (t) => {
    const log = await changelog(
      ['fix(scope1): First fix', 'feat(scope2): Second feature'],
      {
        feat: { title: 'Feature title', changelog: true },
        fix: { title: 'Fix title' },
      }
    );

    t.regex(log, /### Feature title/);
    t.regex(log, /\* \*\*scope2:\*\* Second feature/);
    t.notRegex(log, /Fix title/);
    t.notRegex(log, /scope1/);
    t.notRegex(log, /First fix/);
  }
);

test.serial('Include type emoji in group titles', async (t) => {
  const log = await changelog(
    ['fix(scope1): First fix', 'feat(scope2): Second feature'],
    {
      feat: { title: 'Feature title', changelog: true, emoji: '✨' },
      fix: { title: 'Fix title', changelog: true, emoji: '🐛' },
    }
  );

  t.regex(log, /### ✨ Feature title/);
  t.regex(log, /### 🐛 Fix title/);
});

test.serial(
  'Include commits with breaking changes even if "changelog" is not set to "true"',
  async (t) => {
    const log = await changelog(
      [
        'fix(scope1): First fix \n\n BREAKING CHANGE: afgshytrsd',
        'feat(scope2): Second feature \n\n BREAKING CHANGE: afgshytrsd',
      ],
      {
        feat: { title: 'Feature title', changelog: false },
        fix: { title: 'Fix title' },
      }
    );

    t.regex(log, /### ⚠ Breaking changes/);
    t.regex(log, /### Fix title/);
    t.regex(log, /\* \*\*scope1:\*\* First fix/);
    t.regex(log, /### Feature title/);
    t.regex(log, /\* \*\*scope2:\*\* Second feature/);
  }
);

test.serial('Do not include "scope" if set to "*"', async (t) => {
  const log = await changelog(['fix(*): First fix'], {
    fix: { title: 'Fix title', changelog: true },
  });

  t.regex(log, /### Fix title/);
  t.regex(log, /\* First fix/);
});

test.serial('Create commit link', async (t) => {
  const log = await changelog(
    ['fix: First fix'],
    { fix: { title: 'Fix title', changelog: true } },
    { pkg: { path: path.join(__dirname, './fixtures/_package.json') } }
  );
  const [, hash] = /\(\[(.*?)\]\(.*?\)\)/.exec(log);

  t.is(hash.length, COMMIT_HASH_LENGTH);
});

test.serial('Create reference link', async (t) => {
  const log = await changelog(
    ['fix: First fix\n\ncloses #123, fix #456'],
    { fix: { title: 'Fix title', changelog: true } },
    { pkg: { path: path.join(__dirname, './fixtures/_package.json') } }
  );

  t.regex(
    log,
    /closes \[#123\]\(https:\/\/github.com\/github_user\/repo_name\/issues\/123\) \[#456\]\(https:\/\/github.com\/github_user\/repo_name\/issues\/456\)/
  );
});

test.serial('Create reference link if referenced in subject', async (t) => {
  const log = await changelog(
    ['fix: First fix closes #123 fix #456'],
    { fix: { title: 'Fix title', changelog: true } },
    { pkg: { path: path.join(__dirname, './fixtures/_package.json') } }
  );

  t.regex(
    log,
    /\* First fix closes \[#123\]\(https:\/\/github.com\/github_user\/repo_name\/issues\/123\) fix \[#456\]\(https:\/\/github.com\/github_user\/repo_name\/issues\/456\)/
  );
});

test.serial('Do not duplicate reference link', async (t) => {
  const log = await changelog(
    ['fix: First fix closes #123 fix #456\n\nfix closes #123'],
    { fix: { title: 'Fix title', changelog: true } },
    { pkg: { path: path.join(__dirname, './fixtures/_package.json') } }
  );

  t.regex(
    log,
    /\* First fix closes \[#123\]\(https:\/\/github.com\/github_user\/repo_name\/issues\/123\) fix \[#456\]\(https:\/\/github.com\/github_user\/repo_name\/issues\/456\)/
  );
});

test.serial('Create mention link', async (t) => {
  const log = await changelog(
    ['fix: Subject, @username @username2'],
    { fix: { title: 'Fix title', changelog: true } },
    { pkg: { path: path.join(__dirname, './fixtures/_package.json') } }
  );

  t.regex(
    log,
    /\* Subject, \[@username\]\(https:\/\/github.com\/username\) \[@username2\]\(https:\/\/github.com\/username2\)/
  );
});

test.serial('Print commit group in order', async (t) => {
  const log = await changelog(
    [
      'docs(scope1): Some doc update',
      'fix(scope1): First fix',
      'feat(scope2): Second feature',
      'chore: some chore',
    ],
    {
      chore: { title: 'Chores', changelog: true, emoji: '♻️' },
      fix: { title: 'Fix title', changelog: true, emoji: '🐛' },
      docs: { title: 'Documentation title', changelog: true, emoji: '📚' },
      feat: { title: 'Feature title', changelog: true, emoji: '✨' },
    }
  );

  t.regex(
    log,
    /[\S\s]*### ✨ Feature title[\S\s]*### 🐛 Fix title[\S\s]*### 📚 Documentation title[\S\s]*### ♻️ Chores/
  );
});
