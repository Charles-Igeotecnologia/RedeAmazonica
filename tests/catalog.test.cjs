const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {filterLots}=require('../docs/assets/catalog.js');
const context={window:{}};
vm.runInNewContext(fs.readFileSync(__dirname+'/../docs/data/lotes.js','utf8'),context);
const lots=Array.from(context.window.LOTES);
test('busca ignora acentos e espaços e encontra documentos e marcos',()=>{
  assert.equal(filterLots(lots,'  campínas  ','all','all')[0].id,'85');
  assert.equal(filterLots(lots,'M-64','all','all')[0].id,'84');
  assert.equal(filterLots(lots,'coordenadas','all','all').length,4);
});
test('situação e categoria são combinadas sem perder os dados de origem',()=>{
  assert.equal(filterLots(lots,'','ok','all').length,3);
  assert.equal(filterLots(lots,'','info','coordenadas').length,0);
  assert.equal(filterLots(lots,'','info','confrontacao')[0].id,'82');
  assert.equal(filterLots(lots,'inexistente','all','all').length,0);
  assert.equal(filterLots(lots,'','all','all').length,5);
  assert.equal(lots.length,5);
});
