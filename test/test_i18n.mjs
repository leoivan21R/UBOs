import { translations, getLanguage, setLanguage, t } from '../js/i18n.js';

console.log('--- TESTING INTERNATIONALIZATION (i18n) MODULE ---');

// Check ES and EN have identical key sets
const esKeys = Object.keys(translations.es);
const enKeys = Object.keys(translations.en);

console.log(`Total ES translation keys: ${esKeys.length}`);
console.log(`Total EN translation keys: ${enKeys.length}`);

const missingInEn = esKeys.filter(k => !(k in translations.en));
const missingInEs = enKeys.filter(k => !(k in translations.es));

if (missingInEn.length > 0) {
  console.error('❌ Keys missing in English:', missingInEn);
  process.exit(1);
} else {
  console.log('✅ All ES keys exist in EN');
}

if (missingInEs.length > 0) {
  console.error('❌ Keys missing in Spanish:', missingInEs);
  process.exit(1);
} else {
  console.log('✅ All EN keys exist in ES');
}

// Test language switcher
setLanguage('en');
if (getLanguage() !== 'en') {
  console.error('❌ Failed to switch to English');
  process.exit(1);
}
if (t('btn_new_case') !== 'New Case') {
  console.error('❌ English translation mismatch for btn_new_case:', t('btn_new_case'));
  process.exit(1);
}
console.log(`✅ EN test: btn_new_case = "${t('btn_new_case')}"`);

// Test parameterized translation
const paramTestEn = t('modal_delete_descendants_notice', { count: 3 });
console.log(`✅ Param EN test: "${paramTestEn}"`);
if (!paramTestEn.includes('3')) {
  console.error('❌ Parameter interpolation failed in EN');
  process.exit(1);
}

setLanguage('es');
if (getLanguage() !== 'es') {
  console.error('❌ Failed to switch to Spanish');
  process.exit(1);
}
if (t('btn_new_case') !== 'Nuevo Caso') {
  console.error('❌ Spanish translation mismatch for btn_new_case:', t('btn_new_case'));
  process.exit(1);
}
console.log(`✅ ES test: btn_new_case = "${t('btn_new_case')}"`);

const paramTestEs = t('modal_delete_descendants_notice', { count: 3 });
console.log(`✅ Param ES test: "${paramTestEs}"`);
if (!paramTestEs.includes('3')) {
  console.error('❌ Parameter interpolation failed in ES');
  process.exit(1);
}

console.log('ALL i18n TESTS PASSED 100%! 🎉');
