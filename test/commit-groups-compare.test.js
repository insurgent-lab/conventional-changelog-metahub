import test from 'ava';
import commitGroupsCompare from './helpers/commit-groups-compare.js';

test('Return ordered commit groups', async (t) => {
  const commitGroups = [
    { title: '📘 Documentation', commits: [{ type: 'docs' }] },
    { title: '🐞 Bug Fixes', commits: [{ type: 'fix' }] },
    { title: 'Features', commits: [{ type: 'feat' }] },
  ];
  const compare = await commitGroupsCompare({
    typesOrder: ['feat', 'fix', 'docs', 'initial', 'metadata'],
    types: {
      feat: { title: 'Features' },
      fix: { title: 'Bug Fixes' },
      docs: { title: 'Documentation' },
    },
  });

  t.deepEqual(commitGroups.sort(compare), [
    { title: 'Features', commits: [{ type: 'feat' }] },
    { title: '🐞 Bug Fixes', commits: [{ type: 'fix' }] },
    { title: '📘 Documentation', commits: [{ type: 'docs' }] },
  ]);
});

test('Return alphabeticaly ordered commit groups not in "typesOrder" at the end of the list', async (t) => {
  const commitGroups = [
    { title: 'b-Test', commits: [{ type: 'btest' }] },
    { title: 'z-Test', commits: [{ type: 'ztest' }] },
    { title: 'Bug Fixes', commits: [{ type: 'fix' }] },
    { title: 'z-Test', commits: [{ type: 'ztest' }] },
    { title: 'a-Test', commits: [{ type: 'atest' }] },
    { title: 'Features', commits: [{ type: 'feat' }] },
  ];
  const compare = await commitGroupsCompare({
    typesOrder: ['feat', 'fix'],
    types: {
      feat: { title: 'Features' },
      fix: { title: 'Bug Fixes' },
      atest: { title: 'a-Test' },
      ztest: { title: 'z-Test' },
      btest: { title: 'b-Test' },
    },
  });

  t.deepEqual(commitGroups.sort(compare), [
    { title: 'Features', commits: [{ type: 'feat' }] },
    { title: 'Bug Fixes', commits: [{ type: 'fix' }] },
    { title: 'a-Test', commits: [{ type: 'atest' }] },
    { title: 'b-Test', commits: [{ type: 'btest' }] },
    { title: 'z-Test', commits: [{ type: 'ztest' }] },
    { title: 'z-Test', commits: [{ type: 'ztest' }] },
  ]);
});
