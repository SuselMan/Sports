// Vite on localhost:5188; isolated browser data, no user history.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || '/home/suselman/projects/pencil/node_modules/playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
(async () => {
 const browser = await chromium.launch({headless:true});
 try {
  const context = await browser.newContext({viewport:{width:390,height:844},locale:'ru-RU',isMobile:true,userAgent:'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/130.0.0.0 Mobile Safari/537.36'});
  const page = await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:5188/exercises');
  await page.evaluate(async()=>{
   localStorage.setItem('sports_language',JSON.stringify('ru'));
   const {upsertExerciseLocal,upsertExerciseRecordLocal}=await import('/src/offline/mutations.ts');
   await upsertExerciseLocal({_id:'111111111111111111111111',name:'Жим гири',type:'REPS',muscles:['Lats','LateralDeltoid'],unilateral:true});
   await upsertExerciseRecordLocal({exerciseId:'111111111111111111111111',kind:'REPS',repsAmount:10,weight:16,side:'left',date:new Date().toISOString()});
  });
  await page.reload();await page.getByText('Жим гири',{exact:true}).click();
  const dialog=page.getByRole('dialog',{name:'Редактировать упражнение',exact:true});await dialog.waitFor();const results=[];
  for(const viewport of [{width:390,height:844},{width:320,height:568},{width:390,height:360},{width:844,height:390}]){
   await page.setViewportSize(viewport);
   const geometry=await dialog.evaluate(el=>{
    const rect=el.getBoundingClientRect();const body=el.lastElementChild;
    body.scrollTop=body.scrollHeight;
    const save=[...el.querySelectorAll('button')].find(b=>b.textContent==='Сохранить');
    const sr=save.getBoundingClientRect();const br=body.getBoundingClientRect();
    return {top:rect.top,bottom:rect.bottom,left:rect.left,right:rect.right,scrollTop:body.scrollTop,saveVisible:sr.top>=br.top&&sr.bottom<=br.bottom,overflow:document.documentElement.scrollWidth>innerWidth};
   });
   assert(geometry.top>=0&&geometry.bottom<=viewport.height+1,'dialog must fit vertically');
   assert(geometry.left>=0&&geometry.right<=viewport.width+1,'dialog must fit horizontally');
   assert(geometry.saveVisible,'save must be reachable by scrolling');assert(!geometry.overflow);
   if(viewport.height<=390)assert(geometry.scrollTop>0,'small screen must scroll');
   results.push({viewport,...geometry});
  }
  await dialog.locator('input[type=text]').first().fill('Жим гири исправлен');
  await dialog.getByRole('button',{name:'Сохранить',exact:true}).click();await dialog.waitFor({state:'hidden'});
  await page.reload();await page.getByText('Жим гири исправлен',{exact:true}).click();
  await dialog.getByRole('button',{name:'Закрыть',exact:true}).click();await dialog.waitFor({state:'hidden'});
  await page.setViewportSize({width:390,height:360});
  await page.goto('http://127.0.0.1:5188/');
  await page.locator('h3').filter({hasText:'Жим гири исправлен'}).click();
  const recordDialog=page.getByRole('dialog').filter({has:page.getByRole('button',{name:'Сохранить',exact:true})});
  await recordDialog.waitFor();
  for(const theme of ['light','dark']) {
   await page.setViewportSize({width:390,height:844});
   await page.evaluate(theme=>document.documentElement.setAttribute('data-theme',theme),theme);
   const inputs=await recordDialog.locator('input').evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect();return {x:r.x,right:r.right,width:r.width};}));
   assert(inputs.length>=3);
   assert(inputs.every(r=>Math.abs(r.x-inputs[0].x)<1&&Math.abs(r.right-inputs[0].right)<1),'date, reps and weight must share edges');
   const title=await recordDialog.getByText('Жим гири исправлен',{exact:true}).boundingBox();
   assert(Math.abs(title.x-inputs[0].x)<1,'exercise title must align with fields');
   const sideSwitch=recordDialog.getByRole('switch',{name:'Правая сторона',exact:true});
   await sideSwitch.click();
   await page.waitForTimeout(250);
   await page.screenshot({path:'diagnostics/record-layout-'+theme+'.png'});
  }
  await page.setViewportSize({width:390,height:360});
  await recordDialog.getByRole('button',{name:'Сохранить',exact:true}).scrollIntoViewIfNeeded();
  const recordRect=await recordDialog.boundingBox();
  const saveRect=await recordDialog.getByRole('button',{name:'Сохранить',exact:true}).boundingBox();
  assert(recordRect.y>=0&&recordRect.y+recordRect.height<=361);
  assert(saveRect.y>=recordRect.y&&saveRect.y+saveRect.height<=360);
  await page.screenshot({path:'diagnostics/modal-short-screen.png'});
  await recordDialog.getByRole('button',{name:'Закрыть',exact:true}).click();
  assert.deepEqual(errors,[]);
  fs.writeFileSync('diagnostics/modal-layout-results.json',JSON.stringify({results,saved:true,close:true,recordEdit:true,errors},null,2));
  console.log('Modal layout checks passed');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
