const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'/home/suselman/projects/pencil/node_modules/playwright');
const assert=require('node:assert/strict');const fs=require('node:fs');
(async()=>{const browser=await chromium.launch({headless:true});try{
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,userAgent:'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/130.0.0.0 Mobile Safari/537.36',timezoneId:'Europe/Moscow'});
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{localStorage.setItem('sports_language','"ru"');localStorage.setItem('sports_statisticsDateRange',JSON.stringify({from:'2026-11-16T21:00:00.000Z',to:'2026-11-17T20:59:59.999Z'}));});
 await page.goto('http://127.0.0.1:5188/statistics');
 await page.evaluate(async()=>{
  const {getDb}=await import('/src/offline/db.ts');const db=await getDb();
  const exercises=[{_id:'push',name:'Жим',type:'REPS',muscles:[]},{_id:'pull',name:'Подтягивания',type:'REPS',muscles:[]},{_id:'time',name:'Ходьба',type:'TIME',muscles:[]},{_id:'empty',name:'Без данных',type:'REPS',muscles:[]},{_id:'arch',name:'Архивное',type:'REPS',muscles:[],archived:true}];
  const make=(id,ex,reps,day,extra={})=>({_id:id,exerciseId:ex,kind:'REPS',repsAmount:reps,date:day+'T09:00:00Z',calendarDate:day,updatedAt:'2026-11-17T10:00:00Z',...extra});
  const records=[make('a','push',10,'2026-11-17',{weight:20}),make('b','push',5,'2026-11-17',{weight:20}),make('old','push',100,'2026-11-01',{weight:100}),make('archset','push',200,'2026-11-17',{archived:true}),make('c','pull',4,'2026-11-17'),make('d','pull',3,'2026-11-17'),make('t','time',undefined,'2026-11-17',{kind:'TIME',durationMs:60000}),make('ar','arch',10,'2026-11-17')];
  const tx=db.transaction(['exercises','exerciseRecords'],'readwrite');for(const e of exercises)await tx.objectStore('exercises').put(e);for(const r of records)await tx.objectStore('exerciseRecords').put(r);await tx.done;
  const {buildStatistics,addTrendLine}=await import('/src/pages/Statistics/data.ts');const stats=buildStatistics(exercises,records,'2026-11-17','2026-11-17');window.qaStats=stats;
  if(stats.length!==3)throw Error('Unexpected groups');const metrics=Object.fromEntries(stats.find(s=>s.exercise._id==='push').metrics.map(m=>[m.key,m.best]));
  if(metrics.maxReps!==10||metrics.dailyReps!==15||metrics.weight!==20||Math.abs(metrics.e1rm-26.6666666667)>1e-6)throw Error('Wrong period aggregation');
  if(stats.find(s=>s.exercise._id==='pull').metrics.some(m=>m.key==='e1rm'))throw Error('Bodyweight e1rm');
  if(stats.find(s=>s.exercise._id==='time').metrics[0].best!==60)throw Error('Duration');
  if(buildStatistics(exercises,records,'2026-11-17','2026-11-17','pull').length!==1)throw Error('Single exercise');
  window.dispatchEvent(new Event('sports-db-change'));
 });
 await page.getByRole('heading',{name:'Жим',exact:true}).waitFor();
 await page.getByRole('heading',{name:'Подтягивания',exact:true}).waitFor();await page.getByRole('heading',{name:'Ходьба',exact:true}).waitFor();
 assert.equal(await page.getByRole('heading',{name:'Без данных',exact:true}).count(),0);
 const chips=page.getByRole('group',{name:'Показатели статистики'}).getByRole('button');assert.equal(await chips.count(),5);
 for(let i=0;i<5;i++)await chips.nth(i).click();await page.getByText('Выбери хотя бы один показатель.',{exact:true}).waitFor();
 // Select only e1RM: only weighted exercise remains.
 await chips.nth(2).click();await page.getByRole('heading',{name:'Жим',exact:true}).waitFor();assert.equal(await page.getByRole('heading',{name:'Подтягивания',exact:true}).count(),0);
 await page.reload();await page.getByRole('heading',{name:'Жим',exact:true}).waitFor();assert.equal(await chips.nth(2).getAttribute('aria-pressed'),'true');assert.equal(await chips.nth(0).getAttribute('aria-pressed'),'false');
 await chips.nth(0).click();await chips.nth(1).click();await page.getByRole('heading',{name:'Подтягивания',exact:true}).waitFor();
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 await page.screenshot({path:'diagnostics/statistics-overview-1.4.0.png',fullPage:true});
 // Empty period, then restore via same date controls as home.
 await page.locator('#date-from').fill('2026-11-16');await page.locator('#date-to').fill('2026-11-16');await page.getByText('Нет данных за выбранный период.',{exact:false}).waitFor();
 await page.goto('http://127.0.0.1:5188/statistics/pull');await page.getByRole('heading',{name:'Подтягивания',exact:true}).waitFor();assert.equal(await page.getByRole('heading',{name:'Жим',exact:true}).count(),0);
 await page.getByRole('button',{name:'menu',exact:true}).click();await page.getByRole('button',{name:'Статистика',exact:true}).click();await page.waitForURL('**/statistics');await page.getByRole('heading',{name:'Жим',exact:true}).waitFor();
 await page.evaluate(()=>document.documentElement.setAttribute('data-theme','dark'));await page.screenshot({path:'diagnostics/statistics-dark-1.4.0.png',fullPage:false});
 assert.deepEqual(errors,[]);fs.writeFileSync('diagnostics/statistics-tests-1.4.0.json',JSON.stringify({aggregation:true,periodBoundary:true,archivedExcluded:true,bodyweightNoE1rm:true,timedExercise:true,chipSelection:true,persistedSelection:true,singleExercise:true,menu:true,mobileOverflow:false,errors},null,2));
 await context.close();
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
