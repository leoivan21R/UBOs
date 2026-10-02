import {
  createInitialModel,
  calculateOwnership,
  validateEntityChildren,
  wouldCreateCycle,
  getExistingPersons,
  SPECIAL_CATEGORIES
} from '../js/engine.js';

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASSED: ${message}`);
  }
}

console.log('--- TEST 1: Exact Example from Specification ---');
const model = createInitialModel('ABC Company', 'Auditor Principal', 'Análisis de prueba');

// Root -> XYZ Corp (50%), RDV Corp (50%)
model.nodes['xyz'] = {
  id: 'xyz',
  parentId: 'node_root',
  name: 'XYZ Corp',
  type: 'business',
  directPercentage: 50.0,
  specialCategory: null
};

model.nodes['rdv'] = {
  id: 'rdv',
  parentId: 'node_root',
  name: 'RDV Corp',
  type: 'business',
  directPercentage: 50.0,
  specialCategory: null
};

// Under XYZ Corp: Peter River (75%), DZY (25%)
model.nodes['peter'] = {
  id: 'peter',
  parentId: 'xyz',
  name: 'Peter River',
  type: 'person',
  personId: 'person_peter',
  directPercentage: 75.0
};

model.nodes['dzy'] = {
  id: 'dzy',
  parentId: 'xyz',
  name: 'DZY',
  type: 'business',
  directPercentage: 25.0,
  specialCategory: null
};

// Under DZY: Maria Ruiz (50%), Leo Rivera (50%)
model.nodes['maria'] = {
  id: 'maria',
  parentId: 'dzy',
  name: 'Maria Ruiz',
  type: 'person',
  personId: 'person_maria',
  directPercentage: 50.0
};

model.nodes['leo_dzy'] = {
  id: 'leo_dzy',
  parentId: 'dzy',
  name: 'Leo Rivera',
  type: 'person',
  personId: 'person_leo',
  directPercentage: 50.0
};

// Under RDV Corp: Jose Perez (33.33%), Luis Castro (33.33%), Leo Rivera (33.33%, linked)
model.nodes['jose'] = {
  id: 'jose',
  parentId: 'rdv',
  name: 'Jose Perez',
  type: 'person',
  personId: 'person_jose',
  directPercentage: 33.33
};

model.nodes['luis'] = {
  id: 'luis',
  parentId: 'rdv',
  name: 'Luis Castro',
  type: 'person',
  personId: 'person_luis',
  directPercentage: 33.33
};

model.nodes['leo_rdv'] = {
  id: 'leo_rdv',
  parentId: 'rdv',
  name: 'Leo Rivera',
  type: 'person',
  personId: 'person_leo', // linked!
  directPercentage: 33.33
};

// Test validations
const rdvVal = validateEntityChildren(model.nodes, 'rdv');
assert(rdvVal.isValid, 'RDV Corp 33.33% x 3 = 99.99% is within tolerance [99.99, 100.01]');

const calc = calculateOwnership(model);

// Check order: Peter River (37.5%), Leo Rivera (22.915%), Luis Castro (16.665%), Jose Perez (16.665%), Maria Ruiz (6.25%)
console.log('Calculated Individuals:');
calc.individuals.forEach(ind => {
  console.log(`- ${ind.name}: ${ind.effectivePercentage.toFixed(4)}% (${ind.routes.length} routes)`);
});

assert(calc.individuals.length === 5, '5 individuals identified');
assert(calc.individuals[0].name === 'Peter River', 'Peter River is #1');
assert(Math.abs(calc.individuals[0].effectivePercentage - 37.5) < 0.001, 'Peter River effective = 37.50%');

const leo = calc.individuals.find(i => i.personId === 'person_leo');
assert(leo, 'Leo Rivera found consolidated');
assert(leo.routes.length === 2, 'Leo Rivera has 2 routes');
assert(Math.abs(leo.effectivePercentage - 22.915) < 0.001, 'Leo Rivera effective = 22.915%');

const maria = calc.individuals.find(i => i.personId === 'person_maria');
assert(Math.abs(maria.effectivePercentage - 6.25) < 0.001, 'Maria Ruiz effective = 6.25%');

console.log('\n--- TEST 2: Special Entity / Stopped Branch ---');
// Add special entity to root: Bank 20%
const specialModel = createInitialModel('Main Corp');
specialModel.nodes['bank'] = {
  id: 'bank',
  parentId: 'node_root',
  name: 'First Example Bank',
  type: 'business',
  directPercentage: 40.0,
  specialCategory: 'financial_institution'
};
specialModel.nodes['indiv'] = {
  id: 'indiv',
  parentId: 'node_root',
  name: 'Alice Cooper',
  type: 'person',
  personId: 'p_alice',
  directPercentage: 60.0
};

const specialCalc = calculateOwnership(specialModel);
assert(specialCalc.specialEntities.length === 1, '1 special entity identified');
assert(specialCalc.specialEntities[0].name === 'First Example Bank', 'First Example Bank is stopped branch');
assert(Math.abs(specialCalc.summary.stoppedInSpecialEntities - 40.0) < 0.001, 'Special entities ownership = 40.0%');
assert(Math.abs(specialCalc.summary.attributedToIndividuals - 60.0) < 0.001, 'Individuals ownership = 60.0%');
assert(Math.abs(specialCalc.summary.totalExplained - 100.0) < 0.001, 'Total explained = 100.0%');

console.log('\n--- TEST 3: Cycle Detection ---');
assert(wouldCreateCycle(model.nodes, 'xyz', 'dzy') === true, 'Prevented cycle: dzy cannot be parent of xyz');
assert(wouldCreateCycle(model.nodes, 'node_root', 'rdv') === true, 'Prevented cycle: rdv cannot be parent of root');
assert(wouldCreateCycle(model.nodes, 'xyz', 'node_root') === false, 'Root can be parent of xyz');

console.log('\n--- TEST 4: Existing Persons Retrieval ---');
const existing = getExistingPersons(model.nodes);
assert(existing.length === 5, 'Found 5 distinct individuals by personId');
const leoInstances = existing.find(e => e.personId === 'person_leo');
assert(leoInstances && leoInstances.instances.length === 2, 'Leo Rivera has 2 instances across branches');

console.log('\nALL ENGINE TESTS COMPLETED SUCCESSFULLY! 🎉');
