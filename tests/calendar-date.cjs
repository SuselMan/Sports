const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'/home/suselman/projects/pencil/node_modules/playwright');
const assert=require('node:assert/strict');const fs=require('node:fs');
(async()=>{const browser=await chromium.launch({headless:true});try{
 for(const timezoneId of ['Europe/Moscow','Europe/Vilnius','America/New_York']){
  const context=await browser.newContext({timezoneId});const page=await context.newPage();await page.goto('http://127.0.0.1:5188/');
  const out=await page.evaluate(async()=>{
   const {calendarDate,withCalendarDate}=await import('/src/offline/calendarDate.ts');
   const winter='2026-11-16T21:00:00.000Z',summer='2026-10-16T21:00:00.000Z';
   const {localBackup,sendHealthData,saveHealthSettings}=await import('/src/offline/healthExport.ts');
   const {getDb}=await import('/src/offline/db.ts');const db=await getDb();
   await db.put('exerciseRecords',{_id:'qa-date',exerciseId:'x',kind:'REPS',repsAmount:3,date:winter,updatedAt:'2026-11-17T09:00:00Z'});
   window.KektrackNative={send(id,url,token,body){window.sent=JSON.parse(body);window.__kektrackReply(id,true,'');}};
   saveHealthSettings({enabled:true,endpoint:'https://example.org/api/kektrack',token:'qa-only'});
   await sendHealthData(true);
   return {winter:calendarDate(winter),summer:calendarDate(summer),explicit:withCalendarDate({date:winter,calendarDate:'2026-11-17'}).calendarDate,backup:(await localBackup()).exerciseRecords[0],sent:window.sent.exerciseRecords[0],raw:await db.get('exerciseRecords','qa-date')};
  });
  assert.equal(out.explicit,'2026-11-17');
  assert.equal(out.backup.calendarDate,out.winter);assert.equal(out.sent.calendarDate,out.winter);
  assert.equal(out.raw.calendarDate,undefined);assert.equal(out.raw.date,'2026-11-16T21:00:00.000Z');
  if(timezoneId==='Europe/Moscow'){assert.equal(out.winter,'2026-11-17');assert.equal(out.summer,'2026-10-17');}
  if(timezoneId==='Europe/Vilnius'){assert.equal(out.winter,'2026-11-16');assert.equal(out.summer,'2026-10-17');}
  await context.close();
 }
 fs.writeFileSync('diagnostics/calendar-tests-1.3.6.json',JSON.stringify({moscow:true,vilnius:true,newYork:true,explicitDatePreserved:true,backupAndExport:true,sourceNotMutated:true},null,2));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
