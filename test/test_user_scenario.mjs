import {
  createInitialModel,
  calculateOwnership,
  validateEntityChildren,
  getExistingPersons,
  generateId
} from '../js/engine.js';

console.log('--- REPRODUCING USER SCENARIO ---');

const model = createInitialModel('Empresa Principal', 'Usuario', 'Prueba caso usuario');

// 1. Dueño 1 de la entidad principal: Individuo al 50%
const ind1Id = 'ind_1';
const person1Id = 'p_juan_perez';
model.nodes[ind1Id] = {
  id: ind1Id,
  parentId: 'node_root',
  name: 'Juan Perez',
  type: 'person',
  personId: person1Id,
  directPercentage: 50.0,
  specialCategory: null
};

// 2. Dueño 2 de la entidad principal: Compañía no exenta al 50%
const compBId = 'comp_b';
model.nodes[compBId] = {
  id: compBId,
  parentId: 'node_root',
  name: 'Compañía B (No Exenta)',
  type: 'business',
  directPercentage: 50.0,
  specialCategory: null
};

// 3. Dueño bajo Compañía B: Mismo primer dueño (Juan Perez) al 25% (vinculado)
const ind1LinkedId = 'ind_1_linked';
model.nodes[ind1LinkedId] = {
  id: ind1LinkedId,
  parentId: compBId,
  name: 'Juan Perez',
  type: 'person',
  personId: person1Id, // vinculado!
  directPercentage: 25.0,
  specialCategory: null
};

// 4. Dueño bajo Compañía B: Nueva persona natural al 25% (Carlos Gomez)
const ind2Id = 'ind_2';
const person2Id = 'p_carlos_gomez';
model.nodes[ind2Id] = {
  id: ind2Id,
  parentId: compBId,
  name: 'Carlos Gomez',
  type: 'person',
  personId: person2Id,
  directPercentage: 25.0,
  specialCategory: null
};

const calc = calculateOwnership(model);

console.log('Resultados Calculados:');
calc.individuals.forEach((ind, i) => {
  console.log(`${i+1}. ${ind.name} — ${ind.effectivePercentage.toFixed(3)}% (${ind.routes.length} ruta(s))`);
  ind.routes.forEach((r, ri) => {
    console.log(`   Ruta ${ri+1}: ${r.pathString} (${r.effectivePercentage.toFixed(3)}%)`);
  });
});

console.log('\nValidaciones de Niveles:');
const compBVal = validateEntityChildren(model.nodes, compBId);
console.log(`Compañía B asignado: ${compBVal.assigned}% | pendiente: ${compBVal.pending}%`);

if (calc.individuals.length === 2 &&
    calc.individuals[0].name === 'Juan Perez' &&
    Math.abs(calc.individuals[0].effectivePercentage - 62.5) < 0.001 &&
    calc.individuals[1].name === 'Carlos Gomez' &&
    Math.abs(calc.individuals[1].effectivePercentage - 12.5) < 0.001) {
  console.log('\n✅ ESCENARIO DEL USUARIO PROBADO Y VERIFICADO EXITOSAMENTE');
} else {
  console.error('\n❌ ERROR EN EL ESCENARIO DEL USUARIO');
  process.exit(1);
}
