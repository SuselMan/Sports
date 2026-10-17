// Run against Vite on localhost:5188. Uses an isolated browser profile.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || '/home/suselman/projects/pencil/node_modules/playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
(async () => {
 const browser = await chromium.launch({ headless: true });
 try {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage(); const errors=[];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('http://127.0.0.1:5188/exercises');
  const field=page.getByLabel('Файл упражнений JSON');
  await field.waitFor();
  const upload=async data => field.setInputFiles({name:'exercises.json',mimeType:'application/json',buffer:Buffer.from(typeof data==='string'?data:JSON.stringify(data))});
  const snapshot=()=>page.evaluate(async()=>{const {localBackup}=await import('/src/offline/healthExport.ts');const data=await localBackup();delete data.exportedAt;return data;});
  // Seed unrelated history and archived exercises: importer must preserve all.
  await page.evaluate(async()=>{const {getDb}=await import('/src/offline/db.ts');const db=await getDb();const tx=db.transaction(['exercises','exerciseRecords','metrics'],'readwrite');await tx.objectStore('exercises').put({_id:'existing',name:'  ТЯГА сидя ',type:'REPS',muscles:[],archived:true,updatedAt:'2026-01-01T00:00:00Z'});await tx.objectStore('exerciseRecords').put({_id:'history',exerciseId:'existing',kind:'REPS',repsAmount:10,date:'2026-01-01T00:00:00Z'});await tx.objectStore('metrics').put({_id:'weight',name:'Вес',unit:'kg'});await tx.done;});
  const before=await snapshot();
  const exercises=[{name:'Тяга сидя',type:'REPS',muscles:['Lats']},{name:'Присед до скамьи',type:'REPS',muscles:['GluteusMaximus']},{name:'  присед   до скамьи  ',type:'REPS',muscles:[]},{name:'Ходьба',type:'TIME',muscles:[]}];
  const fixture={schema:'kektrack-exercises-v1',exercises};
  await upload(fixture);
  assert.equal((await snapshot()).exercises.length,1,'Preview wrote data');
  await page.getByRole('button',{name:'Отмена импорта',exact:true}).click();
  assert.equal((await snapshot()).exercises.length,1);
  await upload(fixture);await page.getByRole('button',{name:'Добавить упражнения',exact:true}).click();
  await page.getByText('Добавлено: 2. Пропущено совпадений: 2.',{exact:true}).waitFor();
  await page.getByRole('heading',{name:'Присед до скамьи',exact:true}).waitFor();
  const after=await snapshot();assert.equal(after.exercises.length,3);assert.deepEqual(after.exercises.find(e=>e._id==='existing'),before.exercises[0]);assert.deepEqual(after.exerciseRecords,before.exerciseRecords);assert.deepEqual(after.metrics,before.metrics);
  await upload(fixture);await page.getByRole('button',{name:'Добавить упражнения',exact:true}).click();await page.getByText('Добавлено: 0. Пропущено совпадений: 4.',{exact:true}).waitFor();
  for(const invalid of ['{broken',{schema:'kektrack-v1',exercises:[]},{schema:'kektrack-exercises-v1',exercises:[exercises[1],{name:'Bad',type:'REPS',muscles:['invalid']}]},{schema:'kektrack-exercises-v1',exercises:[{name:'',type:'REPS',muscles:[]}]},{schema:'kektrack-exercises-v1',exercises:Array(501).fill(exercises[0])}]) {
   await upload(invalid);await page.waitForFunction(()=>document.querySelector('section[aria-label="Импорт упражнений"] [role="status"]').textContent.length>0);assert.deepEqual(await snapshot(),after);
  }
  await upload(' '.repeat(1024*1024+1));await page.getByText('Файл больше 1 МБ',{exact:true}).waitFor();
  await page.reload();await page.getByRole('heading',{name:'Ходьба',exact:true}).waitFor();
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  assert.deepEqual(errors,[]);
  fs.writeFileSync('diagnostics/import-results-1.2.json',JSON.stringify({preview:true,cancel:true,atomicValidation:true,deduplication:true,archivedPreserved:true,historyPreserved:true,invalidRejected:true,sizeLimit:true,persisted:true,mobileOverflow:false,errors},null,2));
  await page.screenshot({path:'diagnostics/import-1.2.png',fullPage:true});
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
