import test from 'node:test';
import assert from 'node:assert/strict';
import {
  INITIAL_PEOPLE,
  PROJECTS,
  filterPeople,
  calculateTeamMetrics,
  analyzeBusFactor,
  formatKoreanCurrency
} from './talentGraphLogic';

test('filterPeople returns all 12 people across 4 SK AX domains with default filters', () => {
  const result = filterPeople(INITIAL_PEOPLE, {
    onlyAvailable: false,
    includeRollOff: true,
    selectedSkills: [],
    selectedDomain: 'ALL',
    searchQuery: ''
  });
  assert.equal(result.length, 12);
});

test('filterPeople filters accurately by SK AX domain and monthly rate ceiling', () => {
  const semiOnly = filterPeople(INITIAL_PEOPLE, {
    onlyAvailable: false,
    includeRollOff: true,
    selectedSkills: [],
    selectedDomain: '반도체',
    searchQuery: ''
  });
  assert.equal(semiOnly.length, 3);
  assert.equal(semiOnly.every(p => p.domain === '반도체'), true);

  const budgetSemi = filterPeople(INITIAL_PEOPLE, {
    onlyAvailable: false,
    includeRollOff: true,
    selectedSkills: [],
    selectedDomain: '반도체',
    maxMonthlyRate: 1600,
    searchQuery: ''
  });
  // p6 is 1950, p7 is 1250, p8 is 1600 -> 2 remain
  assert.equal(budgetSemi.length, 2);
});

test('calculateTeamMetrics computes synergy score, monthly cost, and project budget diff', () => {
  const finProject = PROJECTS.find(p => p.id === 'prj1')!;
  const normMetrics = calculateTeamMetrics(
    INITIAL_PEOPLE,
    ['p1', 'p2'],
    true,
    finProject,
    6
  );
  assert.equal(normMetrics.sharedCount, 1);
  assert.equal(normMetrics.synergyScore, 75);
  assert.equal(normMetrics.totalMonthlyCost, 1850 + 1450); // 3,300만원/월
  assert.equal(normMetrics.totalProjectCost, 3300 * 6); // 19,800만원 (1억 9,800만원)
  assert.equal(normMetrics.budgetDiff, 5000 - 3300); // +1,700만원 여유
  assert.equal(normMetrics.isOverBudget, false);
});

test('analyzeBusFactor and formatKoreanCurrency work accurately', () => {
  const alert = analyzeBusFactor(INITIAL_PEOPLE, 'p1');
  assert.ok(alert);
  assert.equal(alert.person.name, '김현우');
  assert.equal(alert.isolatedClient, 'A금융그룹 차세대 아키텍처 맥락');
  assert.deepEqual(
    alert.backups.map(b => b.id),
    ['p2', 'p5']
  );
  assert.equal(formatKoreanCurrency(28200), '2억 8,200만원');
  assert.equal(formatKoreanCurrency(4850), '4,850만원');
});

test('all 12 people have Chiikawa & Sanrio character avatars including Hangyodon (한교동)', () => {
  assert.equal(
    INITIAL_PEOPLE.every(p => p.avatar.startsWith('data:image/svg+xml;utf8,')),
    true
  );
  const hangyodonPerson = filterPeople(INITIAL_PEOPLE, {
    onlyAvailable: false,
    includeRollOff: true,
    selectedSkills: [],
    selectedDomain: 'ALL',
    searchQuery: '한교동'
  });
  assert.equal(hangyodonPerson.length, 1);
  assert.equal(hangyodonPerson[0].id, 'p1');
  assert.ok(hangyodonPerson[0].characterName.includes('한교동'));
});

