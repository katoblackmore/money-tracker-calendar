const fs=require('fs'),vm=require('vm'),assert=require('assert');
const nodes=new Map();const node=()=>({value:'',style:{},classList:{toggle(){}},elements:new Proxy({},{get:(t,k)=>t[k]??(t[k]={value:''})}),addEventListener(){},setAttribute(){},focus(){},querySelectorAll(){return []},querySelector(){return null},reset(){},showModal(){},close(){}});let saved=null,appearanceSaved=null;
const ctx={document:{documentElement:{dataset:{}},querySelector(){return node()},querySelectorAll(){return []},getElementById:id=>nodes.get(id)||(nodes.set(id,node()),nodes.get(id)),addEventListener(){}},URL,Intl,Date,Number,JSON,Math,String,Array,Object,Set,structuredClone,crypto:require('crypto').webcrypto,localStorage:{getItem:key=>key==='money-tracker-appearance-v1'?appearanceSaved:saved,setItem:(key,s)=>{if(key==='money-tracker-appearance-v1')appearanceSaved=s;else saved=s}},setInterval(){},setTimeout(){},clearTimeout(){},AbortSignal,fetch:async()=>({ok:true,json:async()=>[{cc:'USD',rate:45.0564,exchangedate:'06.10.2026'}]}),confirm:()=>true};vm.createContext(ctx);
let source=fs.readFileSync('app.js','utf8').replace('render();refreshRate();setInterval','render();setInterval');vm.runInContext(source,ctx);
vm.runInContext(`
state.rate={value:45.0564,date:'06.10.2026'};today='2026-10-06';view=new Date('2026-10-06T12:00:00');
if(eventsFor(2026,9).length!==0||eventsFor(2026,11).length!==0||eventsFor(2027,2).length!==0)throw Error('Calendar must be empty without manual payments');
if(isPaid(seed[9],'2026-12-09')||isPaid(seed[9],'2025-12-09'))throw Error('No automatic annual payments');
state.paid['adobe|2026-10-06']={amount:6,currency:'USD'};render();
if(eventsFor(2026,9).length!==1||eventsFor(2026,9)[0].d!=='2026-10-06')throw Error('Actual manual date');
if(!document.getElementById('expensesUsd').textContent.includes('6,00'))throw Error('Actual expense total');
state.paid['telegram|2026-10-07']={amount:29.99,currency:'USD'};
if(eventsFor(2026,9).length!==2)throw Error('Yearly payment manual before due date');
seed[0].amount=100;
if(eventsFor(2026,9)[0].p.amount!==6)throw Error('Payment snapshot preservation');
if(eventsFor(2026,10).length!==0)throw Error('No automatic monthly repeat');
recordKey='adobe|2026-10-06';document.getElementById('removeRecord').onclick();
if(state.paid[recordKey])throw Error('Manual payment removal');
validateState(state);save();
`,ctx);
const ctx2={...ctx};vm.createContext(ctx2);vm.runInContext(source,ctx2);vm.runInContext(`if(!state.rate||state.rate.value!==45.0564)throw Error('Persisted data reload');`,ctx2);
console.log('PASS: empty calendar, manual monthly and annual entries, chosen dates, actual amounts, removal, no automatic repeat and persisted reload');
vm.runInContext(`
if(templateGroups()[0].payments.length!==6)throw Error('Monthly tab');
activeStandardTab='yearly';if(templateGroups()[0].payments.length!==3)throw Error('Yearly tab');
activeStandardTab='home';if(templateGroups()[0].payments.length!==3)throw Error('Home tab');
state.payments.push({...seed[0],id:'legacy-user-card',name:'Legacy custom'});
activeTemplateTab='custom';if(templateGroups()[0].payments[0].id!=='legacy-user-card')throw Error('Legacy custom migration');
if(templateGroups('adobe').flatMap(g=>g.payments).length!==1)throw Error('Search standard from custom');
activeTemplateTab='standard';if(templateGroups('legacy').flatMap(g=>g.payments).length!==1)throw Error('Search custom from standard');
const f=document.getElementById('paymentForm');
for(const [k,v]of Object.entries({name:'New custom',amount:'12',currency:'USD',frequency:'yearly',day:'16',start:'2026-10-16',group:'home',note:''}))f.elements[k].value=v;
editing=null;document.getElementById('paymentForm').onsubmit({preventDefault(){},target:f});
const added=state.payments.find(p=>p.name==='New custom');if(added.kind!=='custom'||activeTemplateTab!=='custom')throw Error('New card destination');
editing=added.id;f.elements.name.value='Updated custom';document.getElementById('paymentForm').onsubmit({preventDefault(){},target:f});
if(templateKind(state.payments.find(p=>p.id===added.id))!=='custom')throw Error('Custom edit retains category');
editing='adobe';f.elements.name.value='Updated Adobe';document.getElementById('paymentForm').onsubmit({preventDefault(){},target:f});
if(templateKind(state.payments.find(p=>p.id==='adobe'))!=='standard')throw Error('Standard edit retains category');
validateState(state);save();
`,ctx2);
const ctx3={...ctx};vm.createContext(ctx3);vm.runInContext(source,ctx3);vm.runInContext(`if(!state.payments.some(p=>p.name==='Updated custom'&&templateKind(p)==='custom'))throw Error('Custom persistence');`,ctx3);
console.log('PASS: tabs, global search, existing custom cards, new card placement, editing and category persistence');
vm.runInContext(`
state.paid={};state.payments=structuredClone(seed);view=new Date('2026-10-16T12:00:00');
if(!addPaymentAt('adobe','2026-10-16'))throw Error('Drop did not add payment');
if(eventsFor(2026,9).length!==1||state.paid['adobe|2026-10-16'].amount!==5.59)throw Error('Drop date and amount');
if(addPaymentAt('adobe','2026-10-16')!==false||eventsFor(2026,9).length!==1)throw Error('Duplicate drop');
if(addPaymentAt('missing','2026-10-16')||addPaymentAt('adobe','2026-02-31'))throw Error('Invalid drop');
if(!addPaymentAt('telegram','2026-10-17'))throw Error('Yearly drop');
if(!addPaymentAt('rent','2026-10-18'))throw Error('Home drop');
if(document.getElementById('cards').innerHTML.includes('card-bottom')||document.getElementById('cards').innerHTML.includes('data-pay='))throw Error('Old payment row');
if(!document.getElementById('cards').innerHTML.includes('draggable="true"'))throw Error('Cards are not draggable');
if(!document.getElementById('calendar').innerHTML.includes('data-date="2026-10-16"'))throw Error('Drop targets missing');
if(document.getElementById('calendar').style.gridTemplateRows!=='repeat(5,minmax(0,1fr))')throw Error('Calendar row sizing');
validateState(state);save();
`,ctx3);
console.log('PASS: drag payment dates, amounts, monthly/home/yearly, duplicate protection, drop targets and removed payment rows');

vm.runInContext(`
state.paid={};render();if(!document.getElementById('expensesUsd').textContent.includes('0,00'))throw Error('Empty expenses');
state.paid['adobe|2026-10-16']={amount:6,currency:'USD'};state.paid['rent|2026-10-17']={amount:4505.64,currency:'UAH'};state.paid['figma|2026-11-06']={amount:20,currency:'USD'};state.rate={value:45.0564,date:'16.10.2026'};view=new Date('2026-10-16T12:00:00');render();
if(!document.getElementById('expensesUsd').textContent.includes('106,00'))throw Error('Mixed-currency expenses');
if(!document.getElementById('expensesUah').textContent.includes('4 775,98'.replace(' ','\u00a0')))throw Error('Expenses in UAH');
if(!document.getElementById('cards').innerHTML.includes('card-prices'))throw Error('Inline price row');
view=new Date('2026-11-06T12:00:00');render();if(!document.getElementById('expensesUsd').textContent.includes('20,00'))throw Error('Expenses month filter');
`,ctx3);
console.log('PASS: expense summary, zero state, USD/UAH conversion, month filter and inline card prices');

vm.runInContext(`
const form=document.getElementById('paymentForm');editing=null;
for(const [k,v]of Object.entries({name:'One-time expense',amount:'135',currency:'UAH',frequency:'once',group:'custom',paymentDate:''}))form.elements[k].value=v;
form.onsubmit({preventDefault(){},target:form});
const once=state.payments.find(p=>p.name==='One-time expense');
if(once.frequency!=='once'||once.group!=='custom'||once.paymentDate!==null||once.kind!=='custom')throw Error('One-time payment without date');
if(!document.getElementById('cards').innerHTML.includes('Единоразовый платёж'))throw Error('One-time card metadata');
if(!addPaymentAt(once.id,'2026-10-21'))throw Error('One-time drop');
validateState(state);save();
`,ctx3);
const ctx4={...ctx};vm.createContext(ctx4);vm.runInContext(source,ctx4);vm.runInContext(`if(!state.payments.some(p=>p.frequency==='once'&&p.group==='custom'))throw Error('One-time reload');if(!validISODate('2028-02-29')||validISODate('2026-02-29'))throw Error('Date validation');`,ctx4);
console.log('PASS: one-time uncategorized payment, optional date, drag to calendar and persisted reload');

const savedPayments=saved;
vm.runInContext(`
if(palettes.length!==8)throw Error('Palette count');
for(const palette of palettes)for(const mode of ['dark','light']){appearance={mode,palette:palette.id};applyAppearance(true);if(document.documentElement.dataset.mode!==mode||document.documentElement.dataset.palette!==palette.id)throw Error('Theme application')}
appearance={mode:'light',palette:'ocean'};applyAppearance(true);
`,ctx4);
if(saved!==savedPayments)throw Error('Appearance changed financial data');
const ctx5={...ctx};vm.createContext(ctx5);vm.runInContext(source,ctx5);vm.runInContext(`if(appearance.mode!=='light'||appearance.palette!=='ocean')throw Error('Appearance persistence');`,ctx5);
console.log('PASS: eight palettes in both modes, appearance persistence and financial data unchanged');

vm.runInContext(`
const f=document.getElementById('paymentForm');editing=null;
for(const [k,v]of Object.entries({name:'Product link check',url:'https://example.com/product?id=123',amount:'12',currency:'USD',frequency:'once',group:'custom',paymentDate:''}))f.elements[k].value=v;
f.onsubmit({preventDefault(){},target:f});
const product=state.payments.find(p=>p.name==='Product link check');if(product.url!=='https://example.com/product?id=123')throw Error('URL save');
openEditor(product.id);if(f.elements.url.value!==product.url)throw Error('URL edit population');
if(validProductURL('javascript:alert(1)')||validProductURL('not a link')||!validProductURL('https://example.com/item'))throw Error('URL validation');
validateState(state);save();
`,ctx5);
const ctx6={...ctx};vm.createContext(ctx6);vm.runInContext(source,ctx6);vm.runInContext(`if(!state.payments.some(p=>p.url==='https://example.com/product?id=123'))throw Error('URL persistence');`,ctx6);
console.log('PASS: optional product URL save, edit, validation and persisted reload');

vm.runInContext(`
const f=document.getElementById('paymentForm');editing=null;
for(const [k,v]of Object.entries({name:'Dated purchase',url:'',amount:'25',currency:'USD',frequency:'once',group:'custom',paymentDate:'2027-01-12'}))f.elements[k].value=v;
f.onsubmit({preventDefault(){},target:f});
const p=state.payments.find(p=>p.name==='Dated purchase'),key=p.id+'|2027-01-12';
if(!state.paid[key]||state.paid[key].amount!==25)throw Error('Create on selected date');
if(eventsFor(2027,0).filter(e=>e.p.id===p.id).length!==1||monthKey()!=='2027-01')throw Error('Show selected month');
if(!document.getElementById('expensesUsd').textContent.includes('25,00'))throw Error('Dated purchase expenses');
const count=Object.keys(state.paid).length;editing=p.id;f.elements.amount.value='30';f.onsubmit({preventDefault(){},target:f});
if(Object.keys(state.paid).length!==count||state.paid[key].amount!==25)throw Error('Editing duplicates payment or changes snapshot');
editing=null;f.elements.name.value='Undated purchase';f.elements.paymentDate.value='';f.onsubmit({preventDefault(){},target:f});
if(Object.keys(state.paid).length!==count)throw Error('Undated creation must remain a card');
validateState(state);save();
`,ctx6);
const ctx7={...ctx};vm.createContext(ctx7);vm.runInContext(source,ctx7);vm.runInContext(`if(!eventsFor(2027,0).some(e=>e.p.name==='Dated purchase'&&e.p.amount===25))throw Error('Dated payment reload');`,ctx7);
console.log('PASS: creation adds dated payment and expenses, switches month, persists, and avoids duplicates on edits');

vm.runInContext(`
state.payments=structuredClone(seed);state.payments.push({...seed[0],id:'category-test',name:'Product',kind:'custom',category:'electronics'});state.paid={};state.rate={value:40,date:'16.10.2026'};
state.paid['adobe|2026-10-01']={amount:10,currency:'USD',category:'subscriptions'};state.paid['rent|2026-10-03']={amount:800,currency:'UAH',category:'housing'};state.paid['category-test|2026-10-02']={amount:5,currency:'USD',category:'electronics'};view=new Date('2026-10-16T12:00:00');
const events=eventsFor(2026,9),opts={currency:'all',category:'all',sort:'date-desc',unit:'USD',group:'none'};
if(filteredMonthEvents(events,opts)[0].p.id!=='rent')throw Error('Date sort');
if(filteredMonthEvents(events,{...opts,currency:'USD'}).length!==2)throw Error('Currency filter');
if(filteredMonthEvents(events,{...opts,category:'housing'}).length!==1)throw Error('Category filter');
if(filteredMonthEvents(events,{...opts,sort:'amount-desc'})[0].p.id!=='rent')throw Error('Normalized amount sort');
if(filteredMonthEvents(events,{...opts,sort:'amount-asc'})[0].p.id!=='category-test')throw Error('Ascending amount sort');
if(total(events).USD!==35||total(events).UAH!==1400)throw Error('Monthly report totals');
reportOptions.group='category';renderMonthViews();if(!document.getElementById('reportList').innerHTML.includes('Техника и электроника'))throw Error('Category grouping');
reportOptions.group='currency';renderMonthViews();if(!document.getElementById('reportList').innerHTML.includes('UAH'))throw Error('Currency grouping');
monthPanelVisible=true;renderMonthViews();if(document.getElementById('monthPaymentsPanel').hidden||!document.getElementById('monthPanelList').innerHTML.includes('Product'))throw Error('Monthly side panel');
monthPanelVisible=false;renderMonthViews();if(!document.getElementById('monthPaymentsPanel').hidden)throw Error('Panel hide');
state.payments.find(p=>p.id==='category-test').category='groceries';if(eventsFor(2026,9).find(e=>e.p.id==='category-test').p.category!=='electronics')throw Error('Historical category snapshot');
if(Object.keys(categories).length<20)throw Error('Category coverage');validateState(state);save();
`,ctx7);
const ctx8={...ctx};vm.createContext(ctx8);vm.runInContext(source,ctx8);vm.runInContext(`if(eventsFor(2026,9).find(e=>e.p.id==='category-test').p.category!=='electronics')throw Error('Category persistence');`,ctx8);
console.log('PASS: category coverage and snapshots, currency/category filters, date/amount sorting, grouping, totals and monthly panel');
vm.runInContext(`
state.payments=structuredClone(seed);state.payments.push({...seed[0],id:'move-once',kind:'custom',frequency:'once',name:'Move purchase',paymentDate:'2026-10-15',category:'electronics'});state.paid={};state.rate={value:40,date:'16.10.2026'};view=new Date('2026-10-16T12:00:00');
state.paid['move-once|2026-10-15']={amount:1300,currency:'UAH',category:'electronics',markedAt:'2026-10-15T00:00:00Z'};
const original=JSON.stringify(state.paid['move-once|2026-10-15']);
if(!movePaymentTo('move-once|2026-10-15','2026-10-14'))throw Error('Move failed');
if(state.paid['move-once|2026-10-15']||JSON.stringify(state.paid['move-once|2026-10-14'])!==original)throw Error('Move snapshot/count');
const once=state.payments.find(p=>p.id==='move-once');if(once.paymentDate!=='2026-10-14'||once.start!=='2026-10-14'||once.day!==14)throw Error('Card date synchronization');
if(total(eventsFor(2026,9)).UAH!==1300)throw Error('Move total');
state.paid['move-once|2026-10-13']={amount:10,currency:'USD'};if(movePaymentTo('move-once|2026-10-14','2026-10-13')||!state.paid['move-once|2026-10-14'])throw Error('Collision protection');
if(movePaymentTo('move-once|2026-10-14','2026-02-30'))throw Error('Invalid date accepted');
if(!movePaymentTo('move-once|2026-10-14','2026-11-01')||monthKey()!=='2026-11'||total(eventsFor(2026,10)).UAH!==1300)throw Error('Cross-month move');
state.paid['adobe|2026-10-04']={amount:5.59,currency:'USD'};state.paid['adobe|2026-09-04']={amount:5.59,currency:'USD'};movePaymentTo('adobe|2026-10-04','2026-10-07');if(state.payments.find(p=>p.id==='adobe').day!==7||!state.paid['adobe|2026-09-04'])throw Error('Monthly template and other records');
validateState(state);save();
`,ctx8);
const ctx9={...ctx};vm.createContext(ctx9);vm.runInContext(source,ctx9);vm.runInContext(`if(!state.paid['move-once|2026-11-01']||state.payments.find(p=>p.id==='move-once').paymentDate!=='2026-11-01')throw Error('Moved date persistence');`,ctx9);
console.log('PASS: calendar move, synchronized card dates, preserved snapshots/totals, collisions, cross-month moves and persistence');
