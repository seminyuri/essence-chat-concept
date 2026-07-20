/* =============================================================================
   Суть ✕ Чат — concept engine (vanilla, zero deps). state + render + interact.
   Placeholder data only (no backend). Everything below is clickable.
   ============================================================================= */
'use strict';
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => (s == null ? '' : String(s)).replace(/[&<>"]/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c]));
const ic = (n, cls = '') => `<svg class="icon ${cls}"><use href="#i-${n}"/></svg>`;
const uid = (() => { let n = 1000; return () => 'x' + (++n); })();
const PHOTOS = [
  'radial-gradient(120% 90% at 30% 18%, #F7E0BE, transparent 55%), linear-gradient(165deg, #E7B98E, #B0705A 55%, #6E4A38)',
  'radial-gradient(120% 90% at 70% 18%, #CFE3F2, transparent 55%), linear-gradient(165deg, #93B4C9, #4F8290 55%, #2E4E58)',
  'radial-gradient(120% 90% at 30% 22%, #E1EFD6, transparent 55%), linear-gradient(165deg, #A9C79A, #6E8B6A 55%, #46603E)',
  'radial-gradient(120% 90% at 65% 18%, #F2D4DC, transparent 55%), linear-gradient(165deg, #D79FAD, #B0708A 55%, #7A4A5E)',
];
const photoBg = i => PHOTOS[((+i)||0) % PHOTOS.length];

/* ─────────────────────────── SAMPLE WORLD ─────────────────────────── */
const U = {
  me:    { name:'Юрий Сёмин',       s:'ЮС', av:'a', pr:'online',   role:'founder' },
  anya:  { name:'Аня Северина',     s:'АС', av:'d', pr:'online',   bio:'Команда заботы · Суть', phone:'+7 905 •••‑12‑40' },
  mark:  { name:'Марк Ливанов',     s:'МЛ', av:'c', pr:'recently', bio:'Оплаты и возвраты · Суть' },
  vera:  { name:'Вера Ильина',      s:'ВИ', av:'f', pr:'online',   bio:'Старшая смены · Суть' },
  alena: { name:'Алёна Ри',         s:'АР', av:'h', pr:'online',   kind:'specialist', bio:'Астролог-консультант · ведёт разборы' },
  yuia:  { name:'Юя',               s:'Ю',  av:'b', kind:'bot',    bio:'AI-ассистент экосистемы «Суть»' },
  maria: { name:'Мария Кольцова',   s:'МК', av:'e', pr:'online',   kind:'client',
           bio:'Клиентка · разбор «Суть Души»', phone:'+7 917 •••‑48‑12',
           natal:{ date:'14 марта 1992', time:'08:20', place:'Самара' } },
  olga:  { name:'Ольга Ремез',      s:'ОР', av:'g', pr:'recently', kind:'client', natal:null },
  dmitry:{ name:'Дмитрий Кан',      s:'ДК', av:'g', pr:'recently', bio:'Управляющий · Филиал Центр' },
  sveta: { name:'Света (Юг)',       s:'С',  av:'d', pr:'online',   bio:'Смена · Филиал Юг' },
  igor:  { name:'Игорь · Рыба Норд', s:'РН', av:'c', kind:'external', via:'MAX', bio:'Поставщик · Рыба Норд', natal:null },
  lena:  { name:'Лена (Изумрудиум)', s:'Л', av:'f', pr:'online' },
  chan:  { name:'Суть · Анонсы', s:'📣', av:'e', kind:'channel' },
};
const AVATAR = (u) => `<span class="chat-avatar chat-avatar--${u.av}">${esc(u.s)}${u.pr?`<span class="chat-avatar__presence${u.pr==='online'?' chat-avatar__presence--online':''}"></span>`:''}</span>`;
const presenceLabel = (u) => u.kind==='bot' ? 'бот' : u.pr==='online' ? 'в сети' : u.pr==='recently' ? 'был(а) недавно' : 'был(а) сегодня';

const ORGS = {
  sut:      { name:'Суть Души',  sub:'', logo:'СД' },
  sushi:    { name:'Суши Мама',  sub:'', logo:'СМ' },
  izum:     { name:'Изумрудиум', sub:'', logo:'И'  },
  personal: { name:'Личное',     sub:'', logo:'ЮС' },
};

/* chats grouped by org. type: dm|group|channel|client|external|saved */
const CHATS = {
  sut: [
    { id:'anya',  type:'dm',      title:'Аня Северина', user:'anya', av:'d', s:'АС', pinned:true, folder:'work',
      last:{by:'me', txt:'Отправила Марии новую ссылку ✓', t:'14:38', read:true}, unread:0 },
    { id:'team',  type:'group',   title:'Суть · Команда', av:'a', s:'СК', folder:'work', members:['me','anya','mark','vera'],
      last:{by:'mark', txt:'Собираемся в 15:00 у Веры', t:'14:20'}, unread:3, typing:'vera' },
    { id:'maria', type:'client',  title:'Мария Кольцова', user:'maria', av:'e', s:'МК', folder:'clients',
      last:{by:'maria', txt:'🎤 Голосовое · 0:07', t:'14:37'}, unread:1 },
    { id:'alena', type:'dm',      title:'Алёна Ри', user:'alena', av:'h', s:'АР', folder:'work', draft:'Спасибо! Гляну сегодня к вечеру',
      last:{by:'alena', txt:'Разбор Марии готовлю к четвергу', t:'13:05'}, unread:0 },
    { id:'announce', type:'channel', title:'Суть · Анонсы', av:'e', s:'📣', icon:'hash', muted:true,
      last:{by:'sys', txt:'Релиз v3 выкатили 🎉', t:'вчера'}, unread:0, subscribers:214 },
    { id:'yuia',  type:'dm',      title:'Юя', user:'yuia', av:'b', s:'Ю',
      last:{by:'yuia', txt:'Готова помочь — спроси что угодно', t:'вчера'}, unread:0 },
    { id:'saved', type:'saved',   title:'Избранное', av:'saved', s:'', icon:'bookmark',
      last:{by:'me', txt:'Пароли от стенда', t:'пн'}, unread:0 },
  ],
  sushi: [
    { id:'upr',   type:'group',   title:'Суши Мама · Управление', av:'a', s:'СМ', folder:'upr', members:['me','dmitry','sveta','anya'],
      last:{by:'me', txt:'План на неделю — в закрепе', t:'09:30', read:true}, unread:0, pinned:true },
    { id:'shift', type:'group',   title:'Филиал Центр · смена', av:'e', s:'ЦС', folder:'center', members:['me','dmitry','sveta'],
      last:{by:'dmitry', txt:'Касса сошлась, всё ок', t:'21:40'}, unread:5 },
    { id:'dmitry',type:'dm',      title:'Дмитрий Кан', user:'dmitry', av:'g', s:'ДК', folder:'center',
      last:{by:'me', txt:'Отчёт по югу пришли к утру', t:'20:10', read:true}, unread:0 },
    { id:'south', type:'group',   title:'Филиал Юг · смена', av:'c', s:'ЮС', folder:'south', members:['me','sveta'],
      last:{by:'sveta', txt:'Открылись, всё по плану', t:'10:05'}, unread:2 },
    { id:'sveta', type:'dm',      title:'Света (Юг)', user:'sveta', av:'d', s:'С', folder:'south',
      last:{by:'sveta', txt:'Списание по акции сделала', t:'19:40', read:true}, unread:0 },
    { id:'supply',type:'external',title:'Игорь · Рыба Норд', user:'igor', av:'c', s:'РН', folder:'suppliers',
      last:{by:'igor', txt:'Привезём в четверг к 9:00', t:'18:22'}, unread:0 },
    { id:'smann', type:'channel', title:'Суши Мама · Приказы', av:'e', s:'📣', icon:'hash',
      last:{by:'sys', txt:'Новое меню с понедельника', t:'вчера'}, unread:0, subscribers:48 },
  ],
  izum: [
    { id:'lena', type:'dm', title:'Лена', user:'lena', av:'f', s:'Л', last:{by:'lena', txt:'Смету скинула', t:'вчера'}, unread:0 },
    { id:'izteam', type:'group', title:'Изумрудиум · Ядро', av:'a', s:'ИЯ', members:['me','lena'], last:{by:'me', txt:'Ок, смотрю', t:'вчера', read:false}, unread:0 },
  ],
  personal: [
    { id:'psaved', type:'saved', title:'Избранное', av:'saved', s:'', icon:'bookmark', last:{by:'me', txt:'Заметка', t:'ср'}, unread:0 },
  ],
};

/* full message threads (others fall back to a light thread from .last) */
const MSGS = {
  anya: [
    { from:'anya', day:'Вчера', t:'11:02', text:'Юр, привет! По Марии Кольцовой — у неё не пришла ссылка на разбор, разбираюсь.' },
    { from:'me',   t:'11:03', text:'Привет 🙏 Ок, что по доставке?' },
    { from:'anya', t:'11:05', text:'Похоже, письмо не ушло из-за сбоя. Перевыслала в Telegram — сейчас проверит.',
      reacts:[{e:'👍', by:['me'], mine:true}] },
    { from:'anya', day:'Сегодня', t:'14:31', text:'Ссылка дошла ✅ Скинула ей ещё голосом — так теплее.' },
    { from:'me',   t:'14:34', text:'Красота. Прикладываю макет карточки клиента — глянь мету справа.',
      replyTo:{who:'Аня Северина', txt:'Ссылка дошла ✅'} },
    { from:'me',   t:'14:35', media:{photo:1}, cap:'client-360.png' },
    { from:'anya', t:'14:37', text:'Огонь. Забираю в поддержку.', reacts:[{e:'🔥', by:['me','vera'], mine:true}] },
    { from:'me',   t:'14:38', text:'Отправила Марии новую ссылку ✓', read:true },
    { from:'anya', t:'14:39', sticker:'🙏' },
  ],
  team: [
    { from:'vera', day:'Сегодня', t:'13:40', text:'Команда, в 15:00 короткий синк по онбордингу клиентов через чат.' },
    { from:'sys',  service:true, text:'<b>Марк Ливанов</b> присоединился к группе' },
    { from:'mark', t:'13:52', text:'Буду. Заодно покажу воронку возвратов.' },
    { from:'me',   t:'14:02', text:'@vera нужен экран приглашения клиента — с тумблером натал-данных.',
      reacts:[{e:'👍', by:['vera','mark','anya'], mine:false}] },
    { from:'anya', t:'14:10', text:'Могу сделать демо на Марии — у неё как раз всё заполнено.' },
    { from:'vera', t:'14:12', poll:{ q:'Когда финализируем экран приглашения?', options:[{t:'Сегодня к 18:00',v:3},{t:'Завтра утром',v:1},{t:'В пятницу',v:0}], total:4, voted:null } },
    { from:'mark', t:'14:15', text:'И вот референс, как «показывают работу» в онбординге:', link:{ title:'Labor illusion в поддержке', desc:'the-essence.ai · заметки', ic:'sparkles' } },
    { from:'mark', t:'14:20', text:'Собираемся в 15:00 у Веры', readBy:['anya','vera'] },
  ],
  maria: [
    { from:'me',   day:'Сегодня', t:'14:25', text:'Мария, добрый день 🙌 Здесь мы теперь на связи по разбору — удобнее, чем врозь в мессенджерах.' },
    { from:'maria',t:'14:30', text:'Ой, спасибо! Так гораздо удобнее 🙂 А в почту тоже придёт или только сюда?' },
    { from:'me',   t:'14:32', text:'Сюда. Всё в одном месте — и ссылка на разбор, и вопросы к специалисту.', read:true },
    { from:'maria',t:'14:37', voice:{ dur:'0:07', wave:[6,10,16,22,14,9,18,24,20,12,8,15,22,10,6,12,18,9],
      transcript:'Поняла, спасибо большое! Тогда буду ждать разбор здесь.' } },
  ],
  supply: [
    { from:'sys', service:true, text:'<b>Игорь · Рыба Норд</b> присоединился по ссылке · вход через MAX' },
    { from:'me',   t:'17:50', text:'Игорь, привет! Давай тут продолжим — не потеряемся по разным мессенджерам.' },
    { from:'igor', t:'18:05', text:'Привет! Ок, удобно. По заказу — лосось и гребешок в наличии.' },
    { from:'me',   t:'18:12', text:'Отлично. Когда сможете привезти?', read:true },
    { from:'igor', t:'18:22', text:'Привезём в четверг к 9:00 👍', reacts:[{e:'👍', by:['me'], mine:true}] },
  ],
  shift: [
    { from:'sveta', day:'Сегодня', t:'20:30', text:'Юг закрылись, выручка чуть выше плана 🎉' },
    { from:'dmitry',t:'21:20', text:'Центр тоже. Сейчас сведу кассу.' },
    { from:'dmitry',t:'21:40', text:'Касса сошлась, всё ок', readBy:['me','sveta'] },
  ],
  upr: [
    { from:'me', day:'Сегодня', t:'09:30', text:'Коллеги, план на неделю закрепил сверху. Вопросы и блокеры — сюда.' },
    { from:'dmitry', t:'09:40', text:'Принял. По Центру всё в графике.' },
    { from:'sveta', t:'09:42', text:'Юг тоже 👍', reacts:[{e:'🔥', by:['me'], mine:true}] },
    { from:'anya', t:'09:55', text:'Напомню: в пятницу инвентаризация в обоих филиалах.' },
  ],
  south: [
    { from:'sveta', day:'Сегодня', t:'10:00', text:'Доброе утро! Открываемся.' },
    { from:'sveta', t:'10:05', text:'Открылись, всё по плану', readBy:['me'] },
  ],
  dmitry: [
    { from:'me', day:'Сегодня', t:'20:00', text:'Дим, как по Центру за смену?' },
    { from:'dmitry', t:'20:05', text:'Плюс 8% к плану, всё чисто ✅' },
    { from:'me', t:'20:10', text:'Отчёт по югу пришли к утру', read:true },
  ],
  sveta: [
    { from:'sveta', day:'Сегодня', t:'19:30', text:'Списание по акции сделала, остатки в норме.' },
    { from:'me', t:'19:38', text:'Супер, спасибо 🙌', read:true },
  ],
  lena: [
    { from:'lena', day:'Вчера', t:'16:15', text:'Юр, привет! Скинула смету по объекту.' },
    { from:'lena', t:'16:15', file:{name:'Смета_объект.xlsx', size:'340 КБ'} },
    { from:'me', t:'16:42', text:'Принял, гляну вечером 🙏', read:true },
    { from:'lena', t:'16:44', text:'Ок, жду 👍', reacts:[{e:'👍', by:['me'], mine:true}] },
  ],
  izteam: [
    { from:'lena', day:'Сегодня', t:'11:00', text:'Собрали ядро по Изумрудиуму — что в приоритете на неделю?' },
    { from:'me', t:'11:20', text:'Сначала лендинг, потом интеграция оплаты.', read:true },
    { from:'me', t:'11:21', text:'Ок, смотрю' },
  ],
  yuia: [
    { from:'yuia', t:'вчера', text:'Привет! Я Юя — помогу найти сообщение, собрать саммари чата или составить ответ. Просто напиши.' },
  ],
  announce: [
    { from:'chan', day:'Вчера', t:'18:00', text:'🎉 Релиз v3 выкатили! Онбординг клиентов через чат — специалисты уже тестируют.', views:214, reacts:[{e:'🎉',by:['me','anya','mark'],mine:true},{e:'🔥',by:['vera'],mine:false}] },
    { from:'chan', t:'18:02', media:{photo:0}, cap:'Новый экран приглашения клиента', views:201 },
    { from:'chan', day:'Сегодня', t:'10:00', text:'Напоминание: в пятницу общий созвон по итогам недели, 17:00.', views:158 },
  ],
};
function lightThread(c){
  const who = c.last.by==='me'?'me':(c.user||c.last.by);
  return [{ from: who==='sys'?'sys':who, service: c.last.by==='sys', t:c.last.t, text:c.last.txt, read:c.last.read }];
}

const FOLDERS_BY_ORG = {
  sut:      [ {id:'all',name:'Все'}, {id:'unread',name:'Непроч.'}, {id:'work',name:'Работа'}, {id:'clients',name:'Клиенты'} ],
  sushi:    [ {id:'all',name:'Все'}, {id:'unread',name:'Непроч.'}, {id:'center',name:'Филиал Центр'}, {id:'south',name:'Филиал Юг'}, {id:'upr',name:'Управление'}, {id:'suppliers',name:'Поставщики'} ],
  izum:     [ {id:'all',name:'Все'}, {id:'unread',name:'Непроч.'} ],
  personal: [ {id:'all',name:'Все'} ],
};
const foldersFor = org => org==='all' ? [{id:'all',name:'Все'},{id:'unread',name:'Непроч.'}] : (FOLDERS_BY_ORG[org] || FOLDERS_BY_ORG.sut);

/* ─────────────────────────── STATE ─────────────────────────── */
const P = new URLSearchParams(location.search);
const S = {
  org: P.get('ws') || localStorage.getItem('sut-chat:org') || 'sut',
  folder: 'all',
  chatId: P.get('chat') || null,
  search: '',
  info: P.get('panel') === '1',
  infoTab: 'media',
  reply: null,
  editId: null,
  read: {},   // chatId -> true once opened (clears unread)
  selMode: false, sel: new Set(), csearch: null,
};
const PINS = { team: 3 };  // chatId -> pinned message index

const userOf = c => U[c.user] || null;
const chatsFor = org => org==='all'
  ? Object.keys(CHATS).flatMap(o => CHATS[o].map(c => Object.assign(c, {_org:o})))
  : (CHATS[org] || []);
const realOrg = () => (S.org==='all' || !CHATS[S.org]) ? 'sut' : S.org;   // куда класть создаваемый чат (в «Все» — в Суть)
const findChat = id => { for (const o in CHATS) { const c = CHATS[o].find(x=>x.id===id); if (c) return c; } return null; };
const threadOf = c => MSGS[c.id] || lightThread(c);

/* ─────────────────────────── RENDER: workspace ─────────────────────────── */
function renderWorkspace(){
  const isAll = S.org==='all';
  const o = isAll ? {name:'Все организации', logo:'∀'} : (ORGS[S.org] || ORGS.sut);
  $('#orgLogo').textContent = o.logo;
  $('#orgName').textContent = o.name;
  $('#orgRole').textContent = isAll ? `${Object.keys(ORGS).length} организации · глобально` : (S.org==='sut'?'Основатель':S.org==='personal'?'Личное пространство':'Администратор');
  if (isAll) document.documentElement.removeAttribute('data-org'); else document.documentElement.setAttribute('data-org', S.org);
  const totalUn = o2 => chatsFor(o2).reduce((a,c)=>a+(S.read[c.id]?0:c.unread||0),0);
  const allUn = Object.keys(ORGS).reduce((a,o2)=>a+totalUn(o2),0);
  const item = (id, name, logo, un, active) => `<button class="shell-ws__item${active?' is-active':''}" data-org="${id}"><span class="chat-ws__logo" style="width:26px;height:26px;font-size:11px;border-radius:8px">${esc(logo)}</span><span class="shell-ws__item-name">${esc(name)}</span>${un?`<span class="chat-ws__optbadge">${un}</span>`:''}${active?`<svg class="icon icon--sm shell-ws__check"><use href="#i-check"/></svg>`:''}</button>`;
  $('#orgMenu').innerHTML = `<div class="shell-ws__cap">Глобальная папка</div>`
    + item('all','Все организации','∀',allUn,isAll)
    + `<div class="shell-ws__div"></div>`
    + Object.entries(ORGS).map(([id,org])=>item(id,org.name,org.logo,totalUn(id),id===S.org)).join('')
    + `<div class="shell-ws__div"></div><button class="shell-ws__link" data-neworg>${ic('plus','icon--sm')} Добавить организацию</button>`;
}

/* ─────────────────────────── RENDER: folders ─────────────────────────── */
function renderFolders(){
  const list = chatsFor(S.org);
  $('#folders').innerHTML = foldersFor(S.org).map(f=>{
    let n = 0;
    if (f.id==='all') n = list.reduce((a,c)=>a+(S.read[c.id]?0:c.unread||0),0);
    else if (f.id==='unread') n = list.filter(c=>!S.read[c.id] && c.unread>0).length;
    else n = list.filter(c=>c.folder===f.id).length;
    const show = f.id==='all' || f.id==='unread' ? n>0 : n>0;
    return `<button class="chat-folder${f.id===S.folder?' is-active':''}" data-folder="${f.id}">
      ${esc(f.name)}${show?`<span class="chat-folder__count">${n}</span>`:''}</button>`;
  }).join('');
}

/* ─────────────────────────── RENDER: chat list ─────────────────────────── */
function chatAvatar(c){
  if (c.av==='saved') return `<span class="chat-avatar chat-avatar--saved">${ic('bookmark')}</span>`;
  const u = userOf(c);
  const pr = u && u.pr ? `<span class="chat-avatar__presence${u.pr==='online'?' chat-avatar__presence--online':''}"></span>` : '';
  return `<span class="chat-avatar chat-avatar--${c.av}">${esc(c.s)}${pr}</span>`;
}
function renderList(){
  const list = chatsFor(S.org).filter(c=>{
    if (S.folder==='unread') return !S.read[c.id] && c.unread>0;
    if (S.folder!=='all') return c.folder===S.folder;
    return true;
  }).filter(c=>{
    if (!S.search) return true;
    return (c.title+' '+(c.last?.txt||'')).toLowerCase().includes(S.search.toLowerCase());
  });
  const pinned = list.filter(c=>c.pinned), rest = list.filter(c=>!c.pinned);
  const row = c=>{
    const unread = S.read[c.id]?0:(c.unread||0);
    const u = userOf(c);
    let snip='';
    if (c.draft && !S.read[c.id]) snip = `<span class="chat-row__snip chat-row__snip--draft">Черновик: ${esc(c.draft)}</span>`;
    else if (c.typing && !S.read[c.id]) snip = `<span class="chat-row__snip chat-row__snip--typing">${esc(U[c.typing].name.split(' ')[0])} печатает…</span>`;
    else {
      const pre = c.type==='group' && c.last.by!=='me' && c.last.by!=='sys' ? `<b>${esc((U[c.last.by]||{name:c.last.by}).name.split(' ')[0])}:</b> ` : (c.last.by==='me'?'Вы: ':'');
      snip = `<span class="chat-row__snip">${pre}${esc(c.last.txt)}</span>`;
    }
    const tick = c.last.by==='me' && !c.typing ? `<span class="chat-tick">${ic(c.last.read?'checks':'check')}</span>` : '';
    return `<div class="chat-row${c.id===S.chatId?' is-active':''}${unread?' has-unread':''}${c.muted?' is-muted':''}" data-chat="${c.id}">
      ${chatAvatar(c)}
      <div class="chat-row__body">
        <div class="chat-row__top">
          <span class="chat-row__name">${c.icon==='hash'?ic('hash','icon--sm chat-row__vfy'):''}${esc(c.title)}${u&&u.kind==='specialist'?ic('sparkles','icon--xs chat-row__vfy'):''}</span>
          ${S.org==='all'&&c._org?`<span class="chat-row__orgtag">${esc(ORGS[c._org].name.split(' ')[0])}</span>`:''}
          <span class="chat-row__time">${esc(c.last.t)}</span>
        </div>
        <div class="chat-row__bot">
          ${snip}
          <div class="chat-row__meta">
            ${c.pinned&&!unread?`<span class="chat-row__pin">${ic('pin','icon--sm')}</span>`:''}
            ${c.muted?`<span class="chat-mini-icon">${ic('mute')}</span>`:''}
            ${tick}
            ${unread?`<span class="chat-unread-dot">${unread}</span>`:''}
          </div>
        </div>
      </div>
    </div>`;
  };
  let html = '';
  if (pinned.length) html += `<div class="chat-list__sec">Закреплённые</div>` + pinned.map(row).join('');
  if (rest.length) html += (pinned.length?`<div class="chat-list__sec">Чаты</div>`:'') + rest.map(row).join('');
  if (!list.length) html = `<div class="empty-state" style="padding:48px 20px"><div class="empty-state__title">Ничего не найдено</div><div class="empty-state__description">Попробуй другой запрос или папку.</div></div>`;
  $('#chatList').innerHTML = html;
}

/* ─────────────────────────── RENDER: conversation ─────────────────────────── */
const AUTHOR_CLASS = { anya:'', mark:'--c', vera:'--d', alena:'', dmitry:'--b', sveta:'--c', igor:'--c', lena:'--d', yuia:'--b' };
function renderConversation(){
  const main = $('#chat-main');
  const c = S.chatId ? findChat(S.chatId) : null;
  if (!c){ main.innerHTML = emptyConversation(); return; }
  S.read[c.id] = true;
  const u = userOf(c);
  // header sub
  let sub;
  if (c.type==='group') sub = `${c.members?.length||0} участников`;
  else if (c.type==='channel') sub = `${c.subscribers} подписчиков`;
  else if (c.type==='saved') sub = 'заметки для себя';
  else if (c.typing) sub = `<span class="chat-cvhead__sub--typing">печатает…</span>`;
  else if (u) sub = u.pr==='online' ? `<span class="chat-cvhead__sub--online">в сети</span>` : presenceLabel(u);
  else sub = '';

  // ribbon for client/external
  let ribbon = '';
  if (c.type==='client'){
    const filled = u?.natal;
    ribbon = filled
      ? `<div class="chat-ribbon chat-ribbon--ok">${ic('sparkles','icon--sm')} Клиент · натал-данные заполнены — онбординг пройден<span class="chat-ribbon__act" data-natal>Открыть карту</span></div>`
      : `<div class="chat-ribbon chat-ribbon--warn">${ic('clock','icon--sm')} Клиент · натал-данные не заполнены<span class="chat-ribbon__act" data-invite="${c.id}">Запросить онбординг</span></div>`;
  } else if (c.type==='external'){
    ribbon = `<div class="chat-ribbon chat-ribbon--ok">${ic('globe','icon--sm')} Внешний контакт · вход через ${esc(u?.via||'MAX')} · натал-данные не запрашиваются</div>`;
  }

  const pinnedIdx = PINS[c.id];
  const pinnedMsg = pinnedIdx!=null ? threadOf(c)[pinnedIdx] : null;
  const pinBar = pinnedMsg ? `<div class="chat-pinned" data-jumppin="${pinnedIdx}"><span class="chat-pinned__bar"></span><div class="chat-pinned__b"><div class="chat-pinned__lbl">Закреплённое</div><div class="chat-pinned__tx">${esc(pinnedMsg.text||'вложение')}</div></div><button class="shell-icon-btn" data-unpin title="Открепить">${ic('x','icon--sm')}</button></div>` : '';
  const searchBar = S.csearch!=null ? `<div class="chat-search-bar"><div class="chat-search-bar__in">${ic('search','icon--sm')}<input id="csIn" placeholder="Поиск в этом чате" value="${esc(S.csearch)}"></div><span class="chat-search-bar__count" id="csCount"></span><button class="shell-icon-btn" data-csnav="-1" title="Выше"><svg class="icon icon--sm" style="transform:rotate(180deg)"><use href="#i-chev-d"/></svg></button><button class="shell-icon-btn" data-csnav="1" title="Ниже">${ic('chev-d','icon--sm')}</button><button class="shell-icon-btn" data-csclose title="Закрыть">${ic('x','icon--sm')}</button></div>` : '';
  const bottom = S.selMode ? bulkBar() : renderComposer(c);
  main.innerHTML =
    `<div class="chat-cvhead">
       <button class="shell-icon-btn chat-back" data-mobile-back>${ic('back')}</button>
       <div class="chat-cvhead__id" data-openinfo>
         ${chatAvatar(c)}
         <div class="chat-cvhead__t">
           <div class="chat-cvhead__name">${c.icon==='hash'?ic('hash','icon--sm'):''}${esc(c.title)}${u&&u.kind==='specialist'?ic('sparkles','icon--sm chat-row__vfy'):''}</div>
           <div class="chat-cvhead__sub">${sub}</div>
         </div>
       </div>
       <div class="chat-cvhead__actions">
         <button class="shell-icon-btn" data-call="audio" title="Аудиозвонок">${ic('phone')}</button>
         <button class="shell-icon-btn" data-call="video" title="Видеозвонок">${ic('video')}</button>
         <button class="shell-icon-btn" data-chatsearch title="Поиск в чате">${ic('search')}</button>
         <button class="shell-icon-btn" data-openinfo title="Инфо">${ic('info')}</button>
         <button class="shell-icon-btn" data-chatmenu title="Ещё">${ic('dots-v')}</button>
       </div>
     </div>
     ${ribbon}${pinBar}${searchBar}
     <div class="chat-scroll${S.selMode?' is-selmode':''}" id="scroll">${renderMessages(c)}</div>
     <button class="chat-jump" id="chatJump" title="Вниз" style="display:none">${ic('arrow-down')}</button>
     ${bottom}`;
  const sc = $('#scroll'); if (sc && S.csearch==null){ sc.scrollTop = sc.scrollHeight; requestAnimationFrame(()=>{ if(sc.isConnected) sc.scrollTop = sc.scrollHeight; }); }
  if (sc){ const jump=$('#chatJump'); const upd=()=>{ if(jump) jump.style.display = (sc.scrollHeight - sc.scrollTop - sc.clientHeight > 160) ? '' : 'none'; }; sc.addEventListener('scroll', upd); }
  if (S.csearch!=null){ const ci=$('#csIn'); if(ci){ ci.focus(); ci.setSelectionRange(ci.value.length,ci.value.length); } updateCSCount(); }
}
function emptyConversation(){
  return `<div class="chat-empty">
    <div class="chat-empty__seal"></div>
    <div class="chat-empty__title">Суть <em>✕</em> Чат</div>
    <div class="chat-empty__desc">Выбери чат слева, чтобы начать. Все разговоры — клиенты, команда, поставщики — в одном месте.</div>
    <div class="chat-empty__badge">🔒 Внутренний мессенджер · сообщения защищены</div>
  </div>`;
}
function renderMessages(c){
  const th = threadOf(c);
  let html = '', lastFrom = null, lastDay = null;
  th.forEach((m,i)=>{
    if (m.service){ html += `<div class="chat-service">${m.text}</div>`; lastFrom=null; return; }
    if (m.day && m.day!==lastDay){ html += `<div class="chat-daysep">${esc(m.day)}</div>`; lastDay=m.day; lastFrom=null; }
    const out = m.from==='me';
    const grouped = m.from===lastFrom;
    lastFrom = m.from;
    const from = out ? U.me : (U[m.from]||{name:m.from,av:'c',s:'?'});
    const showAuthor = !out && (c.type==='group') && !grouped;
    // body
    let body = '';
    if (m.replyTo){ const _tgt = m.replyTo.mid || (threadOf(c).find(x=>x.text && m.replyTo.txt && x.text.includes(m.replyTo.txt))||{}).id || ''; body += `<div class="msg__reply"${_tgt?` data-jumpreply="${_tgt}"`:''}><span class="msg__reply-bar"></span><div style="min-width:0"><div class="msg__reply-who">${esc(m.replyTo.who)}</div><div class="msg__reply-txt">${esc(m.replyTo.txt)}</div></div></div>`; }
    if (m.fwd) body += `<div class="msg__fwd">${ic('forward','icon--xs')} Переслано от <b>${esc(m.fwd)}</b></div>`;
    if (showAuthor) body = `<div class="msg__author msg__author${AUTHOR_CLASS[m.from]||''}">${esc(from.name)}</div>` + body;
    if (m.media){ const pi = m.media.photo!=null ? m.media.photo : 0; body += `<div class="msg__media" data-photo="${pi}" title="Открыть на весь экран"><div style="aspect-ratio:4/3;background:${photoBg(pi)}"></div></div>${m.cap?`<div class="msg__mediacap">${esc(m.cap)}</div>`:''}`; }
    if (m.file) body += `<div class="msg__file"><span class="msg__file-ic">${ic('file')}</span><div style="min-width:0"><div class="msg__file-nm">${esc(m.file.name)}</div><div class="msg__file-sz">${esc(m.file.size)}</div></div><button class="shell-icon-btn" data-dl title="Скачать">${ic('download','icon--sm')}</button></div>`;
    if (m.voice){
      const bars = m.voice.wave.map(h=>`<span style="height:${Math.max(20,h*3)}%"></span>`).join('');
      body += `<div class="msg__voice"><button class="msg__voice-play">${ic('play','icon--sm')}</button><div class="msg__wave">${bars}</div><span class="msg__voice-dur">${esc(m.voice.dur)}</span></div>
        ${m.voice.transcript?`<div class="msg__transcript"><small>Расшифровка · авто</small>${esc(m.voice.transcript)}</div>`:''}`;
    }
    if (m.poll) body += renderPoll(m.poll);
    if (m.text) body += `<div class="msg__text">${renderText(m.text)}</div>`;
    if (m.link) body += `<div class="msg__linkprev"><span class="msg__linkprev-ic">${ic(m.link.ic||'link')}</span><div style="min-width:0"><div class="msg__linkprev-t">${esc(m.link.title)}</div><div class="msg__linkprev-d">${esc(m.link.desc)}</div></div></div>`;
    // meta
    let meta = `<span class="msg__meta">${m.edited?'<span class="msg__edited">изм. · </span>':''}${esc(m.t)}`;
    if (c.type==='channel' && m.views) meta += ` <span class="msg__readcount">${ic('eye','icon--xs')}${m.views}</span>`;
    else if (out){
      if (m.sending) meta += ` <span class="chat-tick" style="color:var(--color-fg-subtle)">${ic('clock','icon--xs')}</span>`;
      else if (m.readBy && c.type==='group') meta += ` <span class="msg__readcount" data-readby='${esc(JSON.stringify(m.readBy))}'>${ic('eye','icon--xs')}${m.readBy.length}</span>`;
      else meta += ` <span class="chat-tick">${ic(m.read?'checks':'check')}</span>`;
    }
    meta += `</span>`;
    // reacts
    const reacts = (m.reacts&&m.reacts.length) ? `<div class="msg__reacts">${m.reacts.map(r=>`<button class="msg__react${r.mine?' is-mine':''}" data-react="${r.e}"><span>${r.e}</span><span class="msg__react-n">${r.by.length}</span></button>`).join('')}</div>` : '';
    const hover = `<div class="msg__hover"><button data-quick-react title="Реакция">${ic('smile','icon--sm')}</button><button data-quick-reply title="Ответить">${ic('reply','icon--sm')}</button><button data-quick-menu title="Ещё">${ic('dots-h','icon--sm')}</button></div>`;
    const mid = m.id || (m.id = 'm'+i);
    const selCls = S.sel.has(mid) ? ' is-selected' : '';
    const bare = m.sticker ? ' msg__bubble--bare' : '';
    if (m.sticker) body = `<div class="msg__sticker">${m.sticker}</div>`;
    const showAva = !out && c.type!=='channel';
    html += `<div class="msg msg--${out?'out':'in'}${grouped?' is-grouped':''}${selCls}" data-mid="${mid}">
      <div class="msg__sel">${ic('check')}</div>
      ${showAva?`<div class="msg__avatar">${AVATAR(from)}</div>`:''}
      <div class="msg__col"><div class="msg__bubble${bare}">${body}${meta}</div>${reacts}${hover}</div>
    </div>`;
  });
  return html;
}
function linkify(t){ return esc(t).replace(/(https?:\/\/[^\s]+)/g,'<a href="$1" target="_blank" rel="noopener">$1</a>').replace(/@(\w+)/g,'<a href="#" style="color:var(--color-accent-strong)">@$1</a>'); }
function renderText(raw){
  let s = esc(raw).replace(/(https?:\/\/[^\s]+)/g,'<a href="$1" target="_blank" rel="noopener">$1</a>').replace(/@(\w+)/g,'<a href="#" style="color:var(--color-accent-strong)">@$1</a>');
  if (S.csearch){ const q=S.csearch.trim(); if(q){ try{ const rx=new RegExp('('+esc(q).replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')(?![^<]*>)','gi'); s=s.replace(rx,'<mark class="chat-hl">$1</mark>'); }catch(e){} } }
  return s;
}
function renderPoll(p){
  return `<div class="msg__poll"><div class="msg__poll-q">${esc(p.q)}</div><div class="msg__poll-meta">${p.voted!=null?('Анонимный опрос · '+p.total+' голос(ов)'):('Опрос · '+p.total+' проголосовали · нажми, чтобы ответить')}</div>${p.options.map((o,oi)=>{const pct=p.total?Math.round(o.v/p.total*100):0;return `<button class="msg__poll-opt${p.voted===oi?' is-voted':''}" data-vote="${oi}"><span class="msg__poll-fill" style="width:${p.voted!=null?pct:0}%"></span><span class="msg__poll-row"><span class="msg__poll-txt">${esc(o.t)}</span>${p.voted!=null?`<span class="msg__poll-pct">${pct}%</span>`:''}${p.voted===oi?`<span class="msg__poll-check">${ic('check','icon--sm')}</span>`:''}</span></button>`;}).join('')}</div>`;
}
function bulkBar(){
  return `<div class="chat-bulk"><span class="chat-bulk__n" id="bulkN">${S.sel.size} выбрано</span><span class="chat-bulk__sp"></span>
    <button class="chat-bulk__btn" data-bulk="forward">${ic('forward','icon--sm')} Переслать</button>
    <button class="chat-bulk__btn" data-bulk="copy">${ic('copy','icon--sm')} Копировать</button>
    <button class="chat-bulk__btn chat-bulk__btn--danger" data-bulk="delete">${ic('trash','icon--sm')} Удалить</button>
    <button class="chat-bulk__btn" data-bulk="cancel">${ic('x','icon--sm')} Отмена</button></div>`;
}
function updateCSCount(){
  const marks = $$('#scroll .chat-hl'); const el=$('#csCount');
  S._csMarks = marks; S._csIdx = 0;
  if (el) el.textContent = marks.length ? '1/'+marks.length : (S.csearch?'0':'');
  if (marks.length) marks[0].scrollIntoView({block:'center'});
}
function csNav(dir){
  const marks = S._csMarks||[]; if(!marks.length) return;
  S._csIdx = (S._csIdx + dir + marks.length) % marks.length;
  const m = marks[S._csIdx]; if(m){ m.scrollIntoView({block:'center'}); }
  const el=$('#csCount'); if(el) el.textContent=(S._csIdx+1)+'/'+marks.length;
}
function flashMsg(mid){ const el=$(`.msg[data-mid="${mid}"]`); if(el){ el.classList.remove('is-flash'); void el.offsetWidth; el.classList.add('is-flash'); el.scrollIntoView({block:'center'}); setTimeout(()=>el.classList.remove('is-flash'),1200); } }
function votePoll(mid, oi){ const c=findChat(S.chatId); const th=MSGS[c.id]=threadOf(c).slice(); const m=th.find(x=>x.id===mid); if(!m||!m.poll||m.poll.voted!=null) return; m.poll.voted=oi; m.poll.options[oi].v++; m.poll.total++; const sc=$('#scroll'); const top=sc?sc.scrollTop:0; if(sc){ sc.innerHTML=renderMessages(c); sc.scrollTop=top; } }
function exitSel(){ S.selMode=false; S.sel.clear(); renderConversation(); }
function onBulk(cmd){
  if (cmd==='cancel') return exitSel();
  const c=findChat(S.chatId); const n=S.sel.size;
  if (cmd==='delete'){ MSGS[c.id]=threadOf(c).slice().filter(m=>!S.sel.has(m.id)); toast(n+' удалено'); exitSel(); }
  else if (cmd==='copy'){ const txt=threadOf(c).filter(m=>S.sel.has(m.id)).map(m=>m.text||'вложение').join('\n'); navigator.clipboard?.writeText(txt); toast('Скопировано'); exitSel(); }
  else if (cmd==='forward'){ toast(n+' сообщ. — выбери, куда переслать'); exitSel(); }
}

function renderComposer(c){
  if (c.type==='channel') return `<div class="cmp"><div class="cmp__broadcast">${ic('bell','icon--sm')} Канал · только владелец публикует · <button class="btn btn--link" style="height:auto">${c.muted?'Включить уведомления':'Отключить уведомления'}</button></div></div>`;
  const reply = S.reply ? `<div class="cmp__reply">${ic('reply','cmp__reply-ic')}<div class="cmp__reply-b"><div class="cmp__reply-who">Ответ · ${esc(S.reply.who)}</div><div class="cmp__reply-tx">${esc(S.reply.txt)}</div></div><button class="shell-icon-btn cmp__reply-x" data-clear-reply>${ic('x','icon--sm')}</button></div>` : '';
  const editBar = (S.editId && !S.reply) ? `<div class="cmp__reply">${ic('pen','cmp__reply-ic')}<div class="cmp__reply-b"><div class="cmp__reply-who">Редактирование</div><div class="cmp__reply-tx">${esc((threadOf(c).find(x=>x.id===S.editId)||{}).text||'')}</div></div><button class="shell-icon-btn cmp__reply-x" data-clear-edit>${ic('x','icon--sm')}</button></div>` : '';
  return `<div class="cmp">
    ${reply}${editBar}
    <div class="cmp__bar">
      <button class="cmp__iconbtn" data-attach title="Прикрепить">${ic('clip','icon--sm')}</button>
      <textarea class="cmp__input" id="cmpInput" rows="1" placeholder="Сообщение…"></textarea>
      <button class="cmp__iconbtn" data-emoji title="Эмодзи">${ic('smile','icon--sm')}</button>
      <button class="cmp__iconbtn" data-voice title="Голосовое">${ic('mic','icon--sm')}</button>
      <button class="cmp__send" id="cmpSend" title="Отправить">${ic('send')}</button>
    </div>
  </div>`;
}

/* ─────────────────────────── RENDER: info panel ─────────────────────────── */
function renderInfo(){
  const p = $('#infoPanel');
  if (!S.info || !S.chatId){ p.hidden = true; return; }
  p.hidden = false;
  const c = findChat(S.chatId); const u = userOf(c);
  const title = c.type==='group'?'Инфо о группе':c.type==='channel'?'Инфо о канале':c.type==='client'?'Профиль клиента':c.type==='external'?'Внешний контакт':'Профиль';
  const isPerson = u && (c.type==='dm'||c.type==='client'||c.type==='external');
  let hero = `<div class="info__hero">${chatAvatar(c).replace('chat-avatar ','chat-avatar ')}<div class="info__hero-name">${esc(c.title)}</div><div class="info__hero-sub${u&&u.pr==='online'?' info__hero-sub--online':''}">${c.type==='group'?(c.members.length+' участников'):c.type==='channel'?(c.subscribers+' подписчиков'):u?presenceLabel(u):''}</div></div>`;
  let actions = `<div class="info__actions">
    <button class="info__act" data-call="audio"><span class="info__act-ic">${ic('phone','icon--sm')}</span>Звонок</button>
    <button class="info__act" data-call="video"><span class="info__act-ic">${ic('video','icon--sm')}</span>Видео</button>
    <button class="info__act" data-infomute><span class="info__act-ic">${ic(c.muted?'bell':'mute','icon--sm')}</span>${c.muted?'Вкл. звук':'Без звука'}</button>
    <button class="info__act" data-chatsearch><span class="info__act-ic">${ic('search','icon--sm')}</span>Поиск</button>
  </div>`;
  let body = '';
  if (u?.bio) body += `<div class="info__sec"><div class="info__label">О контакте</div><div class="info__bio">${esc(u.bio)}</div></div>`;
  if (u?.phone) body += `<div class="info__sec"><div class="info__row">${ic('phone','info__row-ic')}<div class="info__row-b"><div class="info__row-v">${esc(u.phone)}</div><div class="info__row-k">телефон</div></div></div>${u.via?`<div class="info__row">${ic('globe','info__row-ic')}<div class="info__row-b"><div class="info__row-v">${esc(u.via)}</div><div class="info__row-k">канал входа</div></div></div>`:''}</div>`;
  // natal card for client
  if (c.type==='client'){
    const n = u?.natal;
    body += `<div class="info__natal"><div class="info__natal-h">${ic('sparkles','icon--sm')} Натальные данные</div>
      <div class="info__natal-grid">
        <span class="info__natal-k">Дата</span><span class="info__natal-v${n?'':' info__natal-v--empty'}">${n?esc(n.date):'не указана'}</span>
        <span class="info__natal-k">Время</span><span class="info__natal-v${n&&n.time?'':' info__natal-v--empty'}">${n&&n.time?esc(n.time):'не указано'}</span>
        <span class="info__natal-k">Место</span><span class="info__natal-v${n&&n.place?'':' info__natal-v--empty'}">${n&&n.place?esc(n.place):'не указано'}</span>
      </div>
      ${!n?`<button class="btn btn--secondary btn--sm" style="margin-top:10px;width:100%" data-invite="${c.id}">Запросить онбординг</button>`:''}
    </div>`;
  }
  // members for group
  if (c.type==='group'){
    body += `<div class="info__sec" style="padding:8px 16px"><button class="info__member" style="width:100%;padding:6px 0" data-groupadmin><span class="info__addmembers-ic">${ic('shield','icon--sm')}</span><div class="info__member-b"><div class="info__member-nm">Права и управление</div><div class="info__member-pr">роли · кто что может · медленный режим</div></div>${ic('chev-r','icon--sm')}</button></div>`;
    body += `<div class="info__addmembers" data-addmembers><span class="info__addmembers-ic">${ic('user-plus','icon--sm')}</span>Добавить участников</div>`;
    const roles = { me:'owner', anya:'admin', dmitry:'admin' };
    body += (c.members||[]).map(id=>{
      const mu = U[id]||{name:id,av:'c',s:'?'}; const r = roles[id];
      return `<div class="info__member">${AVATAR(mu)}<div class="info__member-b"><div class="info__member-nm">${esc(mu.name)}${id==='me'?' (вы)':''}</div><div class="info__member-pr${mu.pr==='online'?' info__member-pr--online':''}">${presenceLabel(mu)}</div></div>${r?`<span class="info__role info__role--${r}">${r==='owner'?'владелец':'админ'}</span>`:''}</div>`;
    }).join('');
  }
  // tabs
  const tabs = `<div class="info__tabs">
    ${['media','files','links','voice'].map(t=>`<button class="info__tab${t===S.infoTab?' is-active':''}" data-infotab="${t}">${({media:'Медиа',files:'Файлы',links:'Ссылки',voice:'Голос'})[t]}</button>`).join('')}
  </div>`;
  let tabBody = '';
  if (S.infoTab==='media') tabBody = `<div class="info__media-grid">${Array.from({length:6}).map((_,i)=>`<div data-photo="${i%4}" style="aspect-ratio:1;border-radius:8px;background:${photoBg(i%4)};cursor:zoom-in"></div>`).join('')}</div>`;
  else tabBody = `<div class="empty-state" style="padding:36px 16px"><div class="empty-state__description">Пока пусто.</div></div>`;

  p.innerHTML = `<div class="info__head"><button class="shell-icon-btn" data-closeinfo>${ic('x','icon--sm')}</button><div class="info__title">${title}</div><button class="shell-icon-btn" data-hint="Редактирование — в полной версии">${ic('pen','icon--sm')}</button></div>
    <div class="info__scroll">${hero}${actions}${body}${tabs}${tabBody}</div>`;
}

/* ─────────────────────────── OVERLAYS ─────────────────────────── */
const OV = $('#overlays');
function closeOverlays(){ OV.innerHTML=''; }
function lightbox(photo){
  const w = document.createElement('div'); w.className='lightbox';
  w.innerHTML = `<button class="lightbox__close" data-lbclose>${ic('x')}</button><div class="lightbox__img" style="width:min(880px,92vw);aspect-ratio:4/3;background:${photoBg(photo)}"></div>`;
  document.body.appendChild(w);
  w.addEventListener('click', e=>{ if(e.target.closest('[data-lbclose]')||e.target.classList.contains('lightbox')) w.remove(); });
}
function popover(html, x, y, cls=''){
  closeOverlays();
  const w = document.createElement('div'); w.className='ov-pop '+cls; w.innerHTML=html;
  w.style.cssText='position:fixed;z-index:1050;';
  OV.appendChild(w);
  const r = w.firstElementChild ? w : w;
  const bw = w.offsetWidth, bh = w.offsetHeight;
  let px = Math.min(x, innerWidth-bw-12), py = Math.min(y, innerHeight-bh-12);
  w.style.left = Math.max(12,px)+'px'; w.style.top = Math.max(12,py)+'px';
  setTimeout(()=>document.addEventListener('pointerdown', onDoc, {once:true}),0);
  function onDoc(e){ if(!w.contains(e.target)) closeOverlays(); }
  return w;
}
const EMOJI = ['❤️','👍','🔥','😂','😮','😢','🙏','🎉','👏','✅','🤝','💯','😍','🤔','🥳','💛','☀️','✨'];
function reactBar(mid, x, y){
  popover(`<div class="ctx-react">${EMOJI.slice(0,7).map(e=>`<button class="ctx-react__e" data-e="${e}">${e}</button>`).join('')}<button class="ctx-react__e ctx-react__more" data-more>${ic('plus','icon--sm')}</button></div>`, x-150, y-52);
  OV.addEventListener('click', e=>{ const b=e.target.closest('[data-e]'); if(b){ toggleReact(mid,b.dataset.e); closeOverlays(); return; } if(e.target.closest('[data-more]')){ emojiPicker({react:mid},x,y); } });
}
function contextMenu(mid, x, y){
  const c = findChat(S.chatId); const m = threadOf(c).find(x=>x.id===mid);
  const own = m && m.from==='me';
  const items = [
    ['reply','Ответить','reply'],
    ['forward','Переслать','forward'],
    ['copy','Копировать','copy'],
    ['pin','Закрепить','pin'],
    own?['edit','Изменить','pen']:null,
    ['select','Выделить','check'],
    own?['delete','Удалить','trash','danger']:null,
  ].filter(Boolean);
  const emojiRow = `<div class="ctx-react">${EMOJI.slice(0,7).map(e=>`<button class="ctx-react__e" data-ctxe="${e}">${e}</button>`).join('')}<button class="ctx-react__e ctx-react__more" data-ctxmore>${ic('plus','icon--sm')}</button></div>`;
  const menu = `<div class="menu" style="min-width:206px">${items.map(it=>`<button class="menu__item${it[3]?' menu__item--danger':''}" data-cm="${it[0]}">${ic(it[2],'icon--sm')} ${it[1]}</button>`).join('')}</div>`;
  popover(`<div class="ctx-wrap">${emojiRow}${menu}</div>`, x, y);
  OV.addEventListener('click', e=>{
    const ee=e.target.closest('[data-ctxe]'); if(ee){ toggleReact(mid, ee.dataset.ctxe); closeOverlays(); return; }
    if(e.target.closest('[data-ctxmore]')){ emojiPicker({react:mid}, x, y); return; }
    const b=e.target.closest('[data-cm]'); if(b){ onContext(b.dataset.cm, mid); closeOverlays(); }
  });
}
function onContext(cmd, mid){
  const c = findChat(S.chatId); const m = threadOf(c).find(x=>x.id===mid); if(!m)return;
  if (cmd==='reply') setReply(m);
  else if (cmd==='react') { const r=$(`.msg[data-mid="${mid}"] .msg__bubble`).getBoundingClientRect(); reactBar(mid, r.left+r.width/2, r.top); }
  else if (cmd==='copy') { navigator.clipboard?.writeText(m.text||''); toast('Скопировано'); }
  else if (cmd==='edit') { S.editId=mid; S.reply=null; renderConversation(); const inp=$('#cmpInput'); if(inp){inp.value=m.text||''; inp.focus(); inp.setSelectionRange(inp.value.length,inp.value.length); inp.closest('.cmp__bar')?.classList.add('has-text');} }
  else if (cmd==='delete'){ const th=MSGS[c.id]=threadOf(c).slice(); const i=th.findIndex(x=>x.id===mid); if(i>-1)th.splice(i,1); renderConversation(); toast('Сообщение удалено'); }
  else if (cmd==='pin'){ PINS[S.chatId]=threadOf(c).findIndex(x=>x.id===mid); renderConversation(); toast('Закреплено'); }
  else if (cmd==='forward') forwardPicker(mid);
  else if (cmd==='select'){ S.selMode=true; S.sel=new Set([mid]); renderConversation(); }
}
function readByPopover(list, x, y){
  const html = `<div class="menu" style="min-width:220px;max-height:280px;overflow:auto">
    <div class="menu__label">Прочитано · ${list.length}</div>
    ${list.map(id=>{const u=U[id]||{name:id,av:'c',s:'?'};return `<div class="menu__item" style="cursor:default">${AVATAR(u).replace('chat-avatar chat-avatar','chat-avatar chat-avatar')}<span style="flex:1">${esc(u.name)}${id==='me'?' (вы)':''}</span><span style="font-family:var(--type-mono);font-size:10px;color:var(--color-fg-subtle)">14:2${Math.floor(Math.random()*9)}</span></div>`;}).join('')}
  </div>`;
  popover(html, x-110, y+8);
}
function emojiPicker(target, x, y){
  const all = [...EMOJI, '🙂','😉','😅','😭','😡','🤗','🫶','👀','🚀','⭐','🌙','🔮','☕','🍣','🐟','📦','💬','⏰','📎','🎁','💎'];
  const html = `<div style="width:300px;background:var(--color-bg-elevated);border:var(--hairline-width) solid var(--color-border-strong);border-radius:var(--radius-lg);box-shadow:var(--shadow-pop);padding:10px">
    <div style="display:grid;grid-template-columns:repeat(8,1fr);gap:2px">${all.map(e=>`<button class="ep-e" data-e="${e}" style="height:34px;border-radius:8px;font-size:20px;transition:background .1s">${e}</button>`).join('')}</div>
  </div>`;
  const w = popover(html, x?x-150:innerWidth-360, y?y-360:innerHeight-320);
  $$('.ep-e',w).forEach(b=>{b.onmouseenter=()=>b.style.background='var(--color-bg-muted)';b.onmouseleave=()=>b.style.background='';});
  w.addEventListener('click', e=>{ const b=e.target.closest('.ep-e'); if(!b)return;
    if (target && target.react){ toggleReact(target.react, b.dataset.e); closeOverlays(); }
    else { const inp=$('#cmpInput'); if(inp){inp.value+=b.dataset.e; inp.focus(); inp.closest('.cmp__bar')?.classList.add('has-text');} }
  });
}
function forwardPicker(mid){
  const list = chatsFor(S.org);
  modal(`<div class="modal__header"><div class="modal__title">Переслать</div><button class="modal__close" data-close>✕</button></div>
    <div class="modal__body" style="max-height:50vh"><div class="chat-search" style="margin-bottom:8px"><input placeholder="Кому переслать…" style="border:0;background:none;outline:none;width:100%;font:inherit"></div>
    ${list.map(c=>`<button class="chat-row" style="width:100%" data-fwd="${c.id}">${chatAvatar(c)}<div class="chat-row__body"><div class="chat-row__name">${esc(c.title)}</div></div></button>`).join('')}</div>`,'md');
  OV.addEventListener('click', e=>{ const b=e.target.closest('[data-fwd]'); if(!b)return; closeOverlays(); openChat(b.dataset.fwd); toast('Переслано'); });
}
function modal(inner, size='md'){
  closeOverlays();
  OV.innerHTML = `<div class="modal-back" style="position:fixed;inset:0;z-index:1040;background:rgba(20,15,10,.44);backdrop-filter:blur(3px);display:grid;place-items:center;padding:20px">
    <div class="modal__panel modal--${size}" style="max-width:${size==='sm'?420:size==='lg'?760:560}px;width:100%">${inner}</div></div>`;
  OV.querySelector('.modal-back').addEventListener('click', e=>{ if(e.target.classList.contains('modal-back')||e.target.closest('[data-close]')) closeOverlays(); });
}
let toastT;
function toast(msg){
  clearTimeout(toastT);
  let t = $('#toast'); if(!t){ t=document.createElement('div'); t.id='toast'; t.style.cssText='position:fixed;left:50%;bottom:28px;transform:translateX(-50%) translateY(10px);z-index:1060;background:var(--color-fg);color:var(--color-bg-elevated);padding:10px 16px;border-radius:var(--radius-full);font-size:13px;font-weight:500;box-shadow:var(--shadow-pop);opacity:0;transition:opacity .2s,transform .2s'; document.body.appendChild(t); }
  t.textContent = msg; requestAnimationFrame(()=>{ t.style.opacity='1'; t.style.transform='translateX(-50%) translateY(0)'; });
  toastT = setTimeout(()=>{ t.style.opacity='0'; t.style.transform='translateX(-50%) translateY(10px)'; }, 2200);
}

/* ⌘K palette */
function cmdk(){
  const html = `<div class="modal-back" style="position:fixed;inset:0;z-index:1050;background:rgba(20,15,10,.4);backdrop-filter:blur(4px);display:flex;justify-content:center;padding-top:12vh">
    <div style="width:min(640px,92vw);height:max-content;max-height:70vh;background:var(--color-bg-elevated);border:var(--hairline-width) solid var(--color-border-strong);border-radius:var(--radius-xl);box-shadow:var(--shadow-pop);overflow:hidden;display:flex;flex-direction:column">
      <div style="display:flex;align-items:center;gap:10px;padding:14px 16px;border-bottom:var(--hairline-width) solid var(--color-border)">
        ${ic('search')}<input id="ckIn" placeholder="Поиск чатов, людей, команд…" style="flex:1;border:0;background:none;outline:none;font:inherit;font-size:16px;color:var(--color-fg)"><span class="shell-search__kbd">esc</span>
      </div>
      <div id="ckList" style="overflow:auto;padding:6px"></div>
    </div></div>`;
  OV.innerHTML = html;
  const orgOf = cid => { for(const o in CHATS) if(CHATS[o].find(x=>x.id===cid)) return o; return 'sut'; };
  const ckChat = (c,o) => `<button class="menu__item" data-ck="${c.id}" data-ck-org="${o}"><span class="chat-avatar chat-avatar--${c.av}" style="width:32px;height:32px;font-size:12px">${c.av==='saved'?ic('bookmark','icon--sm'):esc(c.s)}</span><span style="flex:1;text-align:left;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(c.title)}</span><span style="font-size:10px;color:var(--color-fg-subtle);font-family:var(--type-mono)">${esc(ORGS[o].name)}</span></button>`;
  const render = q=>{
    const ql=(q||'').trim().toLowerCase();
    if(!ql){ $('#ckList').innerHTML = `<div class="menu__label">Быстрые действия</div><button class="menu__item" data-ck-cmd="new">${ic('pen','icon--sm')} Новый чат</button><button class="menu__item" data-ck-cmd="invite">${ic('user-plus','icon--sm')} Пригласить клиента по ссылке</button><div class="menu__label">Недавние</div>` + chatsFor(S.org).slice(0,5).map(c=>ckChat(c,orgOf(c.id))).join(''); return; }
    let html='';
    const chats=[]; for(const o in CHATS) for(const c of CHATS[o]){ if(c.title.toLowerCase().includes(ql)) chats.push([c,o]); }
    if(chats.length) html+=`<div class="menu__label">Чаты</div>`+chats.slice(0,5).map(([c,o])=>ckChat(c,o)).join('');
    const people=Object.entries(U).filter(([id,u])=>id!=='me'&&id!=='chan'&&u.name.toLowerCase().includes(ql));
    if(people.length) html+=`<div class="menu__label">Люди</div>`+people.slice(0,5).map(([id,u])=>`<button class="menu__item" data-ckperson="${id}"><span class="chat-avatar chat-avatar--${u.av}" style="width:32px;height:32px;font-size:12px">${esc(u.s)}</span><span style="flex:1;text-align:left">${esc(u.name)}</span><span style="font-size:10px;color:var(--color-fg-subtle)">${esc(presenceLabel(u))}</span></button>`).join('');
    const msgs=[]; outer: for(const cid in MSGS){ for(const m of MSGS[cid]){ if(m.text && m.text.toLowerCase().includes(ql)){ msgs.push([cid,m]); if(msgs.length>=6) break outer; } } }
    if(msgs.length) html+=`<div class="menu__label">Сообщения</div>`+msgs.map(([cid,m])=>{ const c=findChat(cid); return `<button class="menu__item" data-ckmsg="${cid}" data-ckmid="${m.id||''}" data-ck-org="${orgOf(cid)}"><span class="shell-bell__icon shell-bell__icon--muted" style="width:30px;height:30px;border-radius:9px;flex:none">${ic('message','icon--sm')}</span><span style="flex:1;min-width:0;text-align:left"><span style="display:block;font-size:11.5px;color:var(--color-fg-subtle)">${esc(c?c.title:'')}</span><span style="display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(m.text)}</span></span></button>`; }).join('');
    if(!html) html=`<div class="empty-state" style="padding:28px 16px"><div class="empty-state__description">Ничего не найдено</div></div>`;
    $('#ckList').innerHTML=html;
  };
  render('');
  const inp=$('#ckIn'); inp.focus();
  inp.addEventListener('input',()=>render(inp.value));
  OV.querySelector('.modal-back').addEventListener('click',e=>{ if(e.target.classList.contains('modal-back'))closeOverlays();
    const c=e.target.closest('[data-ck]'); if(c){ S.org=c.dataset.ckOrg; localStorage.setItem('sut-chat:org',S.org); closeOverlays(); renderAll(); openChat(c.dataset.ck); }
    const cmd=e.target.closest('[data-ck-cmd]'); if(cmd){ closeOverlays(); cmd.dataset.ckCmd==='invite'?inviteModal():newChatMenu(); }
    const pp=e.target.closest('[data-ckperson]'); if(pp){ closeOverlays(); startDM(pp.dataset.ckperson); }
    const mm=e.target.closest('[data-ckmsg]'); if(mm){ S.org=mm.dataset.ckOrg; localStorage.setItem('sut-chat:org',S.org); closeOverlays(); renderAll(); openChat(mm.dataset.ckmsg); if(mm.dataset.ckmid) setTimeout(()=>flashMsg(mm.dataset.ckmid),180); }
  });
}

/* new chat menu */
function newChatMenu(x=innerWidth/2,y=180){
  modal(`<div class="modal__header"><div class="modal__title">Создать</div><button class="modal__close" data-close>✕</button></div>
    <div class="modal__body">
      <button class="menu__item" data-nc="dm">${ic('message','icon--sm')} Новое личное сообщение</button>
      <button class="menu__item" data-nc="group">${ic('users','icon--sm')} Новая группа</button>
      <button class="menu__item" data-nc="channel">${ic('hash','icon--sm')} Новый канал</button>
      <div class="menu__sep"></div>
      <button class="menu__item" data-nc="invite">${ic('user-plus','icon--sm')} Пригласить клиента / внешнего по ссылке</button>
    </div>`,'sm');
  OV.addEventListener('click',e=>{ const b=e.target.closest('[data-nc]'); if(!b)return; const k=b.dataset.nc; closeOverlays();
    if(k==='invite')inviteModal(); else if(k==='dm')contactPicker(); else if(k==='group')newGroupModal(); else if(k==='channel')newChannelModal(); });
}

/* invite modal — the differentiator: link + natal-data toggle */
function inviteModal(){
  let requireNatal = true;
  const render = ()=> modal(`<div class="modal__header"><div class="modal__title">Пригласить по ссылке</div><button class="modal__close" data-close>✕</button></div>
    <div class="modal__body">
      <div class="field" style="margin-bottom:14px"><label class="field__label">Кого приглашаем</label>
        <div class="segmented" style="width:100%">
          <label class="segmented__option segmented__option--active" style="flex:1;justify-content:center">Клиент</label>
          <label class="segmented__option" style="flex:1;justify-content:center">Внешний контакт</label>
        </div></div>
      <label class="toggle" style="display:flex;justify-content:space-between;padding:12px;border:var(--hairline-width) solid var(--color-border);border-radius:var(--radius-md);margin-bottom:14px">
        <span><span class="toggle__label" style="font-weight:600">Запрашивать дату, время и место рождения</span><br><span style="font-size:12px;color:var(--color-fg-subtle)">Для клиента — да (нужно для разбора). Для поставщика/внешнего — можно выключить.</span></span>
        <input type="checkbox" class="toggle__input" id="reqNatal" ${requireNatal?'checked':''}><span class="toggle__track"><span class="toggle__thumb"></span></span>
      </label>
      <div class="field"><label class="field__label">Ссылка-приглашение</label>
        <div style="display:flex;gap:8px"><input class="input" readonly value="https://chat.the-essence.ai/join/${requireNatal?'c':'x'}-8f2a91" style="font-family:var(--type-mono);font-size:12.5px">
        <button class="btn btn--secondary btn--md" data-copylink>${ic('copy','icon--sm')} Копировать</button></div>
        <div class="field__hint" style="margin-top:6px">Действует 7 дней · вход через Telegram / VK / MAX · ${requireNatal?'потребуется онбординг с натал-данными':'без натал-данных'}</div>
      </div>
    </div>
    <div class="modal__footer"><button class="btn btn--ghost btn--md" data-close>Отмена</button><a class="btn btn--primary btn--md" href="?view=join&req=${requireNatal?1:0}">Открыть как клиент →</a></div>`,'md');
  render();
  OV.addEventListener('change',e=>{ if(e.target.id==='reqNatal'){requireNatal=e.target.checked; render();} });
  OV.addEventListener('click',e=>{ if(e.target.closest('[data-copylink]')){navigator.clipboard?.writeText('https://chat.the-essence.ai/join/'+(requireNatal?'c':'x')+'-8f2a91'); toast('Ссылка скопирована');} });
}

/* new DM — contact picker */
function contactPicker(){
  const users = ['anya','mark','vera','alena','maria','dmitry','sveta','igor','lena','yuia'].filter(id=>U[id]);
  modal(`<div class="modal__header"><div class="modal__title">Новое сообщение</div><button class="modal__close" data-close>✕</button></div>
    <div class="modal__body" style="max-height:56vh;padding-top:12px">
      <label class="chat-search" style="margin-bottom:10px">${ic('search','icon--sm')}<input id="cpq" placeholder="Кому написать…" style="border:0;background:none;outline:none;font:inherit;flex:1"></label>
      <div id="cplist">${users.map(id=>`<button class="info__member" style="width:100%" data-dm="${id}">${AVATAR(U[id])}<div class="info__member-b"><div class="info__member-nm">${esc(U[id].name)}</div><div class="info__member-pr${U[id].pr==='online'?' info__member-pr--online':''}">${presenceLabel(U[id])}</div></div></button>`).join('')}</div>
    </div>`,'sm');
  OV.addEventListener('click', e=>{ const b=e.target.closest('[data-dm]'); if(b){ closeOverlays(); startDM(b.dataset.dm); } });
  const q=$('#cpq'); if(q) q.addEventListener('input',()=>{ const v=q.value.toLowerCase(); $$('#cplist [data-dm]').forEach(el=>{ el.style.display=U[el.dataset.dm].name.toLowerCase().includes(v)?'':'none'; }); });
}
function startDM(uid){
  const u=U[uid]; let c=chatsFor(S.org).find(x=>x.user===uid);
  if(!c){ c={ id:'dm_'+uid+'_'+uid, type:u.kind==='client'?'client':u.kind==='external'?'external':(u.kind==='bot'?'dm':'dm'), title:u.name, user:uid, av:u.av, s:u.s, folder:'all', last:{by:'me',txt:'Чат создан',t:nowT(),read:true}, unread:0 }; CHATS[realOrg()].unshift(c); }
  openChat(c.id);
}

/* new group — 2 steps */
function newGroupModal(){
  const chosen=new Set(); let step=1; let color='a';
  const pool=['anya','mark','vera','alena','dmitry','sveta','lena'].filter(id=>U[id]);
  const updChips=()=>{ const el=$('#grpchips'); if(el) el.innerHTML=[...chosen].map(id=>`<span class="chip chip--accent">${esc(U[id].name.split(' ')[0])}</span>`).join('')||'<span class="text-subtle" style="font-size:12.5px">Никого не выбрано</span>'; const nx=$('[data-next]'); if(nx)nx.disabled=!chosen.size; $$('.grp-check').forEach(c=>c.classList.toggle('is-on',chosen.has(c.dataset.c))); };
  const render=()=>{
    if(step===1){
      modal(`<div class="modal__header"><div class="modal__title">Новая группа · участники</div><button class="modal__close" data-close>✕</button></div>
        <div class="modal__body" style="max-height:52vh"><div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px" id="grpchips"></div>
          ${pool.map(id=>`<button class="info__member" style="width:100%" data-pick="${id}">${AVATAR(U[id])}<div class="info__member-b"><div class="info__member-nm">${esc(U[id].name)}</div></div><span class="grp-check" data-c="${id}">${ic('check','icon--xs')}</span></button>`).join('')}</div>
        <div class="modal__footer"><span class="chat-bulk__sp"></span><button class="btn btn--primary btn--md" data-next disabled>Далее →</button></div>`,'sm');
      updChips();
    } else {
      modal(`<div class="modal__header"><div class="modal__title">Новая группа</div><button class="modal__close" data-close>✕</button></div>
        <div class="modal__body">
          <div style="display:flex;gap:14px;align-items:center;margin-bottom:18px"><span class="chat-avatar chat-avatar--${color}" style="width:60px;height:60px;font-size:22px" id="grpav">Г</span>
            <label class="field" style="flex:1"><span class="field__label">Название группы</span><input class="input" id="grpname" placeholder="Например: Проект X"></label></div>
          <div class="field"><span class="field__label">Цвет</span><div class="set__swatches">${['a','b','c','d','e','f'].map(cc=>`<button class="chat-avatar chat-avatar--${cc} grp-color${cc===color?' is-c':''}" data-color="${cc}" style="width:34px;height:34px;font-size:0"></button>`).join('')}</div></div>
          <div class="field__hint" style="margin-top:14px">${chosen.size} участник(ов) + вы</div></div>
        <div class="modal__footer"><button class="btn btn--ghost btn--md" data-back>Назад</button><button class="btn btn--primary btn--md" data-create>Создать</button></div>`,'sm');
    }
  };
  render();
  OV.addEventListener('click', e=>{
    const p=e.target.closest('[data-pick]'); if(p){ const id=p.dataset.pick; chosen.has(id)?chosen.delete(id):chosen.add(id); updChips(); return; }
    if(e.target.closest('[data-next]')){ step=2; render(); return; }
    if(e.target.closest('[data-back]')){ step=1; render(); updChips(); return; }
    const col=e.target.closest('[data-color]'); if(col){ color=col.dataset.color; $$('.grp-color').forEach(x=>x.classList.remove('is-c')); col.classList.add('is-c'); const av=$('#grpav'); if(av)av.className='chat-avatar chat-avatar--'+color; return; }
    if(e.target.closest('[data-create]')){ const name=$('#grpname')?.value.trim()||'Новая группа'; const c={ id:'g_'+uid(), type:'group', title:name, av:color, s:name.replace(/[^\p{L}]/gu,'').slice(0,2).toUpperCase()||'Г', folder:'all', members:['me',...chosen], last:{by:'me',txt:'Группа создана',t:nowT(),read:true}, unread:0 }; CHATS[realOrg()].unshift(c); MSGS[c.id]=[{from:'sys',service:true,text:'<b>Вы</b> создали группу «'+esc(name)+'»'}]; closeOverlays(); openChat(c.id); toast('Группа создана'); return; }
  });
}

/* new channel */
function newChannelModal(){
  modal(`<div class="modal__header"><div class="modal__title">Новый канал</div><button class="modal__close" data-close>✕</button></div>
    <div class="modal__body">
      <div style="display:flex;gap:14px;align-items:center;margin-bottom:16px"><span class="chat-avatar chat-avatar--e" style="width:60px;height:60px">${ic('hash')}</span>
        <label class="field" style="flex:1"><span class="field__label">Название канала</span><input class="input" id="chname" placeholder="Например: Анонсы"></label></div>
      <label class="field" style="margin-bottom:14px"><span class="field__label">Описание</span><textarea class="input" style="height:auto;min-height:60px;padding:10px 12px" placeholder="О чём канал"></textarea></label>
      <div class="set__card"><div class="set__item"><div class="set__item-b"><div class="set__item-t">Публичный</div><div class="set__item-d">Виден по ссылке всем в организации</div></div><label class="toggle"><input type="checkbox" class="toggle__input" checked><span class="toggle__track"><span class="toggle__thumb"></span></span></label></div></div></div>
    <div class="modal__footer"><button class="btn btn--ghost btn--md" data-close>Отмена</button><button class="btn btn--primary btn--md" data-createch>Создать</button></div>`,'sm');
  OV.addEventListener('click', e=>{ if(e.target.closest('[data-createch]')){ const name=$('#chname')?.value.trim()||'Новый канал'; const c={id:'ch_'+uid(),type:'channel',title:name,av:'e',s:'📣',icon:'hash',folder:'all',last:{by:'sys',txt:'Канал создан',t:nowT()},unread:0,subscribers:1}; CHATS[realOrg()].unshift(c); MSGS[c.id]=[{from:'sys',service:true,text:'Канал «'+esc(name)+'» создан'}]; closeOverlays(); openChat(c.id); toast('Канал создан'); } });
}

/* avatar crop */
function avatarCropModal(){
  modal(`<div class="modal__header"><div class="modal__title">Фото профиля</div><button class="modal__close" data-close>✕</button></div>
    <div class="modal__body" style="text-align:center">
      <div style="width:180px;height:180px;border-radius:50%;margin:0 auto 18px;overflow:hidden;background:linear-gradient(140deg,#C98F68,#9A6E55);display:grid;place-items:center;color:#fff;font-size:56px;font-family:var(--font-display);font-weight:700" id="cropav">ЮС</div>
      <label class="field" style="max-width:260px;margin:0 auto"><span class="field__label" style="text-align:left">Масштаб</span><input type="range" min="1" max="2" step="0.01" value="1.2" style="width:100%;accent-color:var(--color-accent)" id="cropzoom"></label>
      <div class="jn__note" style="max-width:300px;margin:16px auto 0">${ic('image','icon--sm')} Перетащи фото, чтобы кадрировать. В прототипе — превью масштаба.</div></div>
    <div class="modal__footer"><button class="btn btn--ghost btn--md" data-close>Отмена</button><button class="btn btn--primary btn--md" data-close>Готово</button></div>`,'sm');
  const z=$('#cropzoom'); if(z) z.addEventListener('input',()=>{ const av=$('#cropav'); if(av) av.style.fontSize=(40*+z.value)+'px'; });
}

/* create poll */
function pollCreateModal(){
  let q='', opts=['',''];
  const render=()=> modal(`<div class="modal__header"><div class="modal__title">Новый опрос</div><button class="modal__close" data-close>✕</button></div>
    <div class="modal__body">
      <label class="field" style="margin-bottom:16px"><span class="field__label">Вопрос</span><input class="input" id="pq" placeholder="Задайте вопрос" value="${esc(q)}"></label>
      <div class="field__label" style="margin-bottom:8px">Варианты ответа</div>
      <div id="popts" style="display:flex;flex-direction:column;gap:8px;margin-bottom:10px">${opts.map((o,i)=>`<input class="input" data-oi="${i}" placeholder="Вариант ${i+1}" value="${esc(o)}">`).join('')}</div>
      ${opts.length<6?`<button class="btn btn--ghost btn--sm" data-addopt>${ic('plus','icon--sm')} Добавить вариант</button>`:''}
    </div>
    <div class="modal__footer"><button class="btn btn--ghost btn--md" data-close>Отмена</button><button class="btn btn--primary btn--md" data-pollcreate>Создать</button></div>`,'sm');
  const sync=()=>{ const pq=$('#pq'); if(pq)q=pq.value; $$('#popts [data-oi]').forEach(i=>opts[+i.dataset.oi]=i.value); };
  render();
  OV.addEventListener('click', e=>{
    if(e.target.closest('[data-addopt]')){ sync(); if(opts.length<6)opts.push(''); render(); return; }
    if(e.target.closest('[data-pollcreate]')){ sync(); const question=q.trim()||'Опрос'; const clean=opts.map(o=>o.trim()).filter(Boolean); if(clean.length<2){ toast('Нужно минимум 2 варианта'); return; } const c=findChat(S.chatId); if(!c) return; const th=MSGS[c.id]=threadOf(c).slice(); th.push({id:'m'+uid(),from:'me',t:nowT(),poll:{q:question,options:clean.map(t=>({t,v:0})),total:0,voted:null},read:false}); c.last={by:'me',txt:'📊 '+question,t:nowT(),read:false}; closeOverlays(); renderConversation(); renderList(); toast('Опрос создан'); return; }
  });
}

/* call overlay — audio / video, 1:1 & group */
let callTimer;
function callOverlay(chatId, kind){
  const c = findChat(chatId); if(!c) return;
  const u = userOf(c);
  const isVideo = kind==='video';
  const isGroup = c.type==='group';
  const av = (uu) => `<span class="call__ava chat-avatar--${uu?uu.av:c.av}">${esc(uu?uu.s:c.s)}</span>`;
  let stage, extraTimer='';
  if (isVideo){
    if (isGroup){
      const mem = (c.members||['me']).slice(0,4);
      const cols = mem.length<=2?mem.length:2;
      stage = `<div class="call__grid" style="grid-template-columns:repeat(${cols},1fr)">${mem.map(id=>`<div class="call__tile">${av(U[id])}<span class="call__tile-nm">${esc((U[id]||{name:'Вы'}).name.split(' ')[0])}${id==='me'?' (вы)':''}</span></div>`).join('')}</div>`;
    } else {
      stage = `<div class="call__remote">${av(u)}</div><div class="call__self">${av(U.me)}</div>`;
    }
    extraTimer = `<div class="call__center" style="justify-content:flex-start;padding-top:24px"><div class="call__st" id="callTimer" style="background:rgba(12,10,7,.42);padding:5px 12px;border-radius:999px">Соединение…</div></div>`;
  } else {
    stage = `<div class="call__center">${av(u||c)}<div class="call__nm">${esc(c.title)}</div><div class="call__st" id="callTimer">Соединение…</div></div>`;
  }
  const wrap = document.createElement('div'); wrap.className='call';
  wrap.innerHTML = `
    <div class="call__top"><div class="call__top-t"><div class="call__top-nm">${esc(c.title)}</div><div class="call__top-st">${isVideo?'Видеозвонок':'Аудиозвонок'}${isGroup?' · группа':''}</div></div>
      <button class="call__mini" data-cend title="Свернуть">${ic('maximize','icon--sm')}</button></div>
    <div class="call__stage">${stage}</div>${extraTimer}
    <div class="call__ctrls">
      <button class="call__btn" data-cmute title="Микрофон">${ic('mic')}</button>
      <button class="call__btn" data-cspk title="Динамик">${ic('volume')}</button>
      <button class="call__btn${isVideo?'':' is-off'}" data-cvid title="Камера">${ic(isVideo?'video':'video-off')}</button>
      <button class="call__btn call__btn--end" data-cend title="Завершить"><svg class="icon" style="transform:rotate(135deg)"><use href="#i-phone"/></svg></button>
    </div>`;
  document.body.appendChild(wrap);
  let secs=0; clearInterval(callTimer);
  setTimeout(()=>{ const t=$('#callTimer'); if(t)t.textContent='00:00'; callTimer=setInterval(()=>{ secs++; const t2=$('#callTimer'); if(t2)t2.textContent=`${String(Math.floor(secs/60)).padStart(2,'0')}:${String(secs%60).padStart(2,'0')}`; },1000); }, 900);
  wrap.addEventListener('click', e=>{
    if(e.target.closest('[data-cend]')){ clearInterval(callTimer); wrap.remove(); return; }
    const mu=e.target.closest('[data-cmute]'); if(mu){ mu.classList.toggle('is-off'); mu.querySelector('use').setAttribute('href', mu.classList.contains('is-off')?'#i-mic-off':'#i-mic'); return; }
    const vd=e.target.closest('[data-cvid]'); if(vd){ vd.classList.toggle('is-off'); vd.querySelector('use').setAttribute('href', vd.classList.contains('is-off')?'#i-video-off':'#i-video'); return; }
    const sp=e.target.closest('[data-cspk]'); if(sp){ sp.classList.toggle('is-off'); return; }
  });
}

/* notifications dropdown */
function notifDropdown(x,y){
  const items = [
    {ic:'message', tone:'accent', t:'<b>Мария Кольцова</b>: голосовое сообщение', tm:'2 мин', unread:true},
    {ic:'at', tone:'accent', t:'<b>Вера</b> упомянула вас в «Суть · Команда»', tm:'12 мин', unread:true},
    {ic:'smile', tone:'warning', t:'<b>Марк</b> отреагировал 🔥 на ваше сообщение', tm:'18 мин'},
    {ic:'user-plus', tone:'success', t:'<b>Дмитрий</b> добавил вас в «Филиал Центр · смена»', tm:'1 ч'},
    {ic:'message', tone:'muted', t:'<b>Аня</b>: новое сообщение', tm:'2 ч'},
  ];
  const html = `<div class="shell-bell__menu is-open" style="position:static;width:360px">
    <div class="shell-bell__head"><div class="shell-bell__heading">Уведомления</div><button class="shell-bell__markall" title="Прочитать все">${ic('checks','icon--sm')}</button></div>
    <div class="shell-bell__list">${items.map(n=>`<div class="shell-bell__row${n.unread?' is-unread':''}">${n.unread?'<span class="shell-bell__row-flag"></span>':''}<div class="shell-bell__row-main"><span class="shell-bell__icon shell-bell__icon--${n.tone}">${ic(n.ic,'icon--sm')}</span><div class="shell-bell__row-body"><div class="shell-bell__row-title">${n.t}</div><div class="shell-bell__row-time">${n.tm}</div></div></div></div>`).join('')}</div>
    <a class="shell-bell__foot" data-hint="Все уведомления — в полной версии">Показать все ${ic('chev-r','icon--sm')}</a></div>`;
  popover(html, x-360, y);
}

/* group admin & permissions */
function groupAdminModal(chatId){
  const c=findChat(chatId); if(!c) return;
  modal(`<div class="modal__header"><div class="modal__title">Управление · ${esc(c.title)}</div><button class="modal__close" data-close>✕</button></div>
    <div class="modal__body" style="max-height:66vh">
      <div class="set__grouph">Тип группы</div>
      <div class="segmented" style="width:100%;margin-bottom:20px"><label class="segmented__option segmented__option--active" style="flex:1;justify-content:center">Приватная</label><label class="segmented__option" style="flex:1;justify-content:center">Публичная</label></div>
      <div class="set__grouph">Участники могут</div>
      <div class="set__card" style="margin-bottom:20px">
        ${toggleRow('Отправлять сообщения','',true)}${toggleRow('Отправлять медиа и файлы','',true)}${toggleRow('Добавлять участников','',false)}${toggleRow('Закреплять сообщения','',false)}${toggleRow('Менять название и фото','',false)}
      </div>
      <div class="set__grouph">Медленный режим</div>
      <div class="set__card" style="margin-bottom:20px"><div class="set__item"><div class="set__item-b"><div class="set__item-t">Задержка между сообщениями</div><div class="set__item-d">Ограничивает флуд в активных группах</div></div>${seg('slow',[['off','Выкл'],['30','30с'],['60','1м'],['300','5м']],'off')}</div></div>
      <div class="set__grouph">Роли</div>
      <div class="set__card">${(c.members||[]).map(id=>{const mu=U[id]||{name:id,av:'c',s:'?'};const role=id==='me'?'owner':(id==='anya'||id==='dmitry')?'admin':'member';return `<div class="info__member" style="padding:10px 14px">${AVATAR(mu)}<div class="info__member-b"><div class="info__member-nm">${esc(mu.name)}${id==='me'?' (вы)':''}</div><div class="info__member-pr">${role==='owner'?'Все права':role==='admin'?'Администратор':'Участник'}</div></div>${role==='owner'?'<span class="info__role info__role--owner">владелец</span>':role==='admin'?'<span class="info__role info__role--admin">админ</span>':'<button class="btn btn--ghost btn--sm" data-promote>Сделать админом</button>'}</div>`;}).join('')}</div>
    </div>`,'md');
  OV.addEventListener('click',e=>{ if(e.target.closest('[data-promote]')) toast('Назначен администратором'); });
}

/* ─────────────────────────── ACTIONS ─────────────────────────── */
function openChat(id){
  S.chatId = id; S.reply=null; S.editId=null;
  const c = findChat(id); if(c){ S.read[id]=true; c.unread=0; c.typing=null; }
  renderList(); renderFolders(); renderWorkspace(); renderConversation(); renderInfo();
  $('#chatBody').setAttribute('data-mobile','chat');
  syncURL();
}
function switchOrg(id){
  S.org=id; S.chatId=null; S.folder='all'; localStorage.setItem('sut-chat:org',id);
  $('#orgSwitch')?.classList.remove('is-open'); $('#orgMenu')?.classList.add('hidden');
  renderAll(); syncURL();
}
function setFolder(id){ S.folder=id; renderFolders(); renderList(); }
function setReply(m){ const who = m.from==='me'?'Вы':(U[m.from]||{name:m.from}).name; S.reply={who,txt:m.text||'вложение', mid:m.id}; renderConversation(); $('#cmpInput')?.focus(); }
function clearReply(){ S.reply=null; renderConversation(); }
function send(){
  const inp=$('#cmpInput'); if(!inp)return; const v=inp.value.trim(); if(!v)return;
  const c=findChat(S.chatId); const th = MSGS[c.id] = threadOf(c).slice();
  if (S.editId){ const m=th.find(x=>x.id===S.editId); if(m){m.text=v;m.edited=true;} S.editId=null; S.reply=null; renderConversation(); renderList(); return; }
  const msg = { id:'m'+uid(), from:'me', t:nowT(), text:v, sending:true, read:false, replyTo:S.reply?{who:S.reply.who,txt:S.reply.txt}:null };
  th.push(msg);
  c.last={by:'me',txt:v,t:nowT(),read:false}; S.reply=null;
  renderConversation(); renderList();
  { const _sc=$('#scroll'); if(_sc) _sc.lastElementChild?.classList.add('msg-in'); }
  // fake delivered→read + a reply for demo liveliness
  setTimeout(()=>{ msg.sending=false; if(S.chatId===c.id) renderConversation(); }, 550);
  setTimeout(()=>{ msg.read=true; if(S.chatId===c.id) renderConversation(); }, 1700);
}
function nowT(){ const d=new Date(); return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`; }
function toggleReact(mid, e){
  const c=findChat(S.chatId); const th=MSGS[c.id]=threadOf(c).slice(); const m=th.find(x=>x.id===mid); if(!m)return;
  m.reacts=m.reacts||[]; let r=m.reacts.find(x=>x.e===e);
  if(r){ if(r.mine){ r.by=r.by.filter(u=>u!=='me'); r.mine=false; if(!r.by.length) m.reacts=m.reacts.filter(x=>x!==r);} else { r.by.push('me'); r.mine=true; } }
  else m.reacts.push({e,by:['me'],mine:true});
  renderConversation();
}
function toggleInfo(v){ S.info = v!=null?v:!S.info; renderInfo(); syncURL(); if(innerWidth<=900&&S.info)$('#chatBody').setAttribute('data-mobile','info'); }
function toggleTheme(){ const d=document.documentElement; const dark=d.getAttribute('data-theme')==='dark'; if(dark)d.removeAttribute('data-theme');else d.setAttribute('data-theme','dark'); localStorage.setItem('the-essence:theme',dark?'light':'dark'); }
function syncURL(){ const p=new URLSearchParams(); if(S.org!=='sut')p.set('ws',S.org); if(S.chatId)p.set('chat',S.chatId); if(S.info)p.set('panel','1'); history.replaceState(null,'','?'+p.toString()); }

function renderAll(){ renderWorkspace(); renderFolders(); renderList(); renderConversation(); renderInfo(); }

/* keyboard navigation */
function visibleChats(){
  const list = chatsFor(S.org).filter(c=>{
    if (S.folder==='unread') return !S.read[c.id] && c.unread>0;
    if (S.folder!=='all') return c.folder===S.folder;
    return true;
  }).filter(c=>!S.search || (c.title+' '+(c.last?.txt||'')).toLowerCase().includes(S.search.toLowerCase()));
  return [...list.filter(c=>c.pinned), ...list.filter(c=>!c.pinned)];
}
function navChat(dir){
  const list=visibleChats(); if(!list.length) return;
  let i=list.findIndex(c=>c.id===S.chatId);
  i = i<0 ? (dir>0?0:list.length-1) : Math.max(0, Math.min(list.length-1, i+dir));
  openChat(list[i].id);
}
function shortcutsOverlay(){
  const rows=[['J / K','Следующий / предыдущий чат'],['/  ·  ⌘K','Поиск и команды'],['Enter','Отправить сообщение'],['Shift + Enter','Новая строка'],['ПКМ по сообщению','Реакции и действия'],['Esc','Закрыть / отменить'],['?','Эта шпаргалка']];
  modal(`<div class="modal__header"><div class="modal__title">Горячие клавиши</div><button class="modal__close" data-close>✕</button></div>
    <div class="modal__body"><div class="set__card">${rows.map(r=>`<div class="set__item"><div class="set__item-b"><div class="set__item-t">${esc(r[1])}</div></div><kbd class="kbd" style="height:auto;padding:3px 9px">${esc(r[0])}</kbd></div>`).join('')}</div></div>`,'sm');
}

/* ─────────────────────────── EVENTS ─────────────────────────── */
document.addEventListener('click', e=>{
  const t = e.target;
  // org switcher (bottom-left, «глобальная папка»)
  if (t.closest('#orgBtn')){ $('#orgSwitch').classList.toggle('is-open'); $('#orgMenu').classList.toggle('hidden'); return; }
  { const wsOpt=t.closest('[data-org]'); if(wsOpt && wsOpt.closest('#orgMenu')){ switchOrg(wsOpt.dataset.org); return; } }
  if (t.closest('[data-neworg]')){ toast('Создание организации — в полной версии'); return; }
  // folders
  const f=t.closest('[data-folder]'); if(f){ setFolder(f.dataset.folder); return; }
  // open chat row
  const row=t.closest('[data-chat]'); if(row && row.closest('#chatList')){ openChat(row.dataset.chat); return; }
  // theme
  if (t.closest('#themeToggle')){ toggleTheme(); return; }
  // settings entry
  if (t.closest('#meAvatar')){ renderSettings('profile'); return; }
  { const railI=t.closest('.shell-apprail__item'); if (railI && railI.title==='Настройки'){ renderSettings('appearance'); return; } }
  { const railI2=t.closest('.shell-apprail__item'); if (railI2 && !railI2.classList.contains('is-active')){ toast('Модуль «'+(railI2.getAttribute('title')||'')+'» — часть экосистемы Суть'); return; } }
  if (t.closest('#bellBtn')){ const r=t.closest('#bellBtn').getBoundingClientRect(); notifDropdown(r.right, r.bottom+8); return; }
  // global search / cmdk
  if (t.closest('#globalSearch')){ cmdk(); return; }
  // new chat
  if (t.closest('#newChatBtn')){ newChatMenu(); return; }
  // conversation header
  if (t.closest('[data-openinfo]')){ closeOverlays(); toggleInfo(true); return; }
  if (t.closest('[data-closeinfo]')){ toggleInfo(false); if(innerWidth<=900)$('#chatBody').setAttribute('data-mobile','chat'); return; }
  if (t.closest('[data-infomute]')){ closeOverlays(); const c=findChat(S.chatId); if(c){ c.muted=!c.muted; toast(c.muted?'Уведомления отключены':'Уведомления включены'); renderInfo(); renderList(); } return; }
  if (t.closest('[data-addmembers]')){ toast('Добавление участников — выбери контакты'); return; }
  if (t.closest('[data-hint]')){ toast(t.closest('[data-hint]').dataset.hint); closeOverlays(); return; }
  if (t.closest('[data-mobile-back]')){ $('#chatBody').setAttribute('data-mobile','list'); return; }
  if (t.closest('[data-chatmenu]')){ const r=t.closest('[data-chatmenu]').getBoundingClientRect(); chatHeaderMenu(r.right-200,r.bottom+6); return; }
  if (t.closest('[data-call]')){ callOverlay(S.chatId, t.closest('[data-call]').dataset.call); return; }
  if (t.closest('[data-chatsearch]')){ closeOverlays(); if(innerWidth<=900)$('#chatBody').setAttribute('data-mobile','chat'); S.csearch=''; renderConversation(); return; }
  if (t.closest('[data-csclose]')){ S.csearch=null; renderConversation(); return; }
  { const cn=t.closest('[data-csnav]'); if(cn){ csNav(+cn.dataset.csnav); return; } }
  if (t.closest('[data-jumppin]')){ const th=threadOf(findChat(S.chatId)); flashMsg(th[+t.closest('[data-jumppin]').dataset.jumppin].id); return; }
  if (t.closest('[data-unpin]')){ delete PINS[S.chatId]; renderConversation(); toast('Откреплено'); return; }
  if (S.selMode){
    const bb=t.closest('[data-bulk]'); if(bb){ onBulk(bb.dataset.bulk); return; }
    const ms=t.closest('.msg'); if(ms){ const id=ms.dataset.mid; if(S.sel.has(id))S.sel.delete(id); else S.sel.add(id); ms.classList.toggle('is-selected'); const bn=$('#bulkN'); if(bn)bn.textContent=S.sel.size+' выбрано'; if(S.sel.size===0)exitSel(); return; }
  }
  { const jr=t.closest('[data-jumpreply]'); if(jr){ flashMsg(jr.dataset.jumpreply); return; } }
  { const md=t.closest('[data-photo]'); if(md && !S.selMode){ lightbox(md.dataset.photo); return; } }
  if (t.closest('.msg__voice-play')){ const b=t.closest('.msg__voice-play'); const playing=b.classList.toggle('is-playing'); const u=b.querySelector('use'); if(u)u.setAttribute('href', playing?'#i-pause':'#i-play'); b.closest('.msg__voice')?.querySelector('.msg__wave')?.classList.toggle('is-playing', playing); return; }
  if (t.closest('[data-dl]')){ toast('Скачивание файла…'); return; }
  { const vt=t.closest('[data-vote]'); if(vt){ const ms=t.closest('.msg'); if(ms)votePoll(ms.dataset.mid,+vt.dataset.vote); return; } }
  // info tabs
  const it=t.closest('[data-infotab]'); if(it){ S.infoTab=it.dataset.infotab; renderInfo(); return; }
  if (t.closest('[data-groupadmin]')){ groupAdminModal(S.chatId); return; }
  // ribbon actions
  if (t.closest('[data-invite]')){ inviteModal(); return; }
  if (t.closest('[data-natal]')){ toggleInfo(true); return; }
  // composer
  if (t.closest('#chatJump')){ const sc=$('#scroll'); if(sc) sc.scrollTo({top:sc.scrollHeight, behavior:'smooth'}); return; }
  if (t.closest('#cmpSend')){ send(); return; }
  { const so=t.closest('[data-sendopt]'); if(so){ closeOverlays(); if($('#cmpInput')?.value.trim()) send(); toast(so.dataset.sendopt==='silent'?'Отправлено без звука':'Запланировано на завтра, 09:00'); return; } }
  if (t.closest('[data-clear-reply]')){ clearReply(); return; }
  if (t.closest('[data-clear-edit]')){ S.editId=null; renderConversation(); return; }
  if (t.closest('[data-emoji]')){ emojiPicker(null); return; }
  if (t.closest('[data-attach]')){ const r=t.closest('[data-attach]').getBoundingClientRect(); attachMenu(r.left,r.top); return; }
  if (t.closest('[data-voice]')){ toast('Запись голосового (демо) — отпусти, чтобы отправить'); return; }
  // message quick actions
  const mEl = t.closest('.msg'); const mid = mEl?.dataset.mid;
  if (t.closest('[data-quick-react]')){ const r=mEl.querySelector('.msg__bubble').getBoundingClientRect(); reactBar(mid, r.left+r.width/2, r.top); return; }
  if (t.closest('[data-quick-reply]')){ const m=threadOf(findChat(S.chatId)).find(x=>x.id===mid); if(m)setReply(m); return; }
  if (t.closest('[data-quick-menu]')){ const r=t.closest('[data-quick-menu]').getBoundingClientRect(); contextMenu(mid, r.left-40, r.bottom+4); return; }
  // reaction toggle
  const rb=t.closest('[data-react]'); if(rb && mEl){ toggleReact(mid, rb.dataset.react); return; }
  // read-by
  const rc=t.closest('[data-readby]'); if(rc){ const r=rc.getBoundingClientRect(); readByPopover(JSON.parse(rc.dataset.readby), r.left, r.bottom); return; }
});
// context menu on right-click of a message
document.addEventListener('contextmenu', e=>{
  if (e.target.closest('#cmpSend')){ e.preventDefault(); const r=e.target.closest('#cmpSend').getBoundingClientRect(); popover(`<div class="menu" style="min-width:214px"><button class="menu__item" data-sendopt="silent">${ic('mute','icon--sm')} Отправить без звука</button><button class="menu__item" data-sendopt="schedule">${ic('clock','icon--sm')} Отправить позже</button></div>`, r.right-214, r.top-96); return; }
  const m=e.target.closest('.msg'); if(m){ e.preventDefault(); contextMenu(m.dataset.mid, e.clientX, e.clientY); }
});
// mobile: long-press a message opens the reaction row + actions
let lpTimer;
document.addEventListener('touchstart', e=>{ const m=e.target.closest('.msg'); if(m && !S.selMode && !e.target.closest('button,a,.msg__poll-opt')){ lpTimer=setTimeout(()=>{ const r=m.querySelector('.msg__bubble').getBoundingClientRect(); contextMenu(m.dataset.mid, Math.min(r.left+20, innerWidth-230), r.top); }, 450); } }, {passive:true});
document.addEventListener('touchend', ()=>clearTimeout(lpTimer));
document.addEventListener('touchmove', ()=>clearTimeout(lpTimer), {passive:true});
// double-click / double-tap to react ❤️
document.addEventListener('dblclick', e=>{ const m=e.target.closest('.msg'); if(m && !e.target.closest('a,button,input,textarea,.msg__poll-opt')){ toggleReact(m.dataset.mid, '❤️'); } });
// swipe-right on a message to reply (mobile)
let swStart=null, swMsg=null;
document.addEventListener('touchstart', e=>{ const m=e.target.closest('.msg'); if(m && !S.selMode && !e.target.closest('button,a,input,textarea')){ swStart={x:e.touches[0].clientX, y:e.touches[0].clientY}; swMsg=m; } }, {passive:true});
document.addEventListener('touchmove', e=>{ if(!swStart||!swMsg) return; const dx=e.touches[0].clientX-swStart.x, dy=e.touches[0].clientY-swStart.y; if(Math.abs(dy)>Math.abs(dx)+6){ swMsg.style.transform=''; swStart=null; return; } if(dx>8){ swMsg.style.transition='none'; swMsg.style.transform='translateX('+Math.min(dx*0.6,60)+'px)'; } }, {passive:true});
document.addEventListener('touchend', e=>{ if(swStart && swMsg){ const dx=e.changedTouches[0].clientX-swStart.x; swMsg.style.transition='transform .18s var(--ease-spring)'; swMsg.style.transform=''; if(dx>48){ const mm=threadOf(findChat(S.chatId)).find(x=>x.id===swMsg.dataset.mid); if(mm){ if(navigator.vibrate)navigator.vibrate(8); setReply(mm); } } } swStart=null; swMsg=null; });
// list search
$('#listSearch').addEventListener('input', e=>{ S.search=e.target.value; renderList(); });
// composer: enter to send, autosize
document.addEventListener('keydown', e=>{
  if ((e.metaKey||e.ctrlKey) && e.key.toLowerCase()==='k'){ e.preventDefault(); cmdk(); return; }
  if (e.key==='Escape'){
    const lb=document.querySelector('.lightbox'); if(lb){ lb.remove(); return; }
    const call=document.querySelector('.call'); if(call){ clearInterval(callTimer); call.remove(); return; }
    if (OV.children.length){ closeOverlays(); return; }
    if (S.csearch!=null){ S.csearch=null; renderConversation(); return; }
    if (S.selMode){ exitSel(); return; }
    if (S.info){ toggleInfo(false); if(innerWidth<=900)$('#chatBody').setAttribute('data-mobile','chat'); return; }
    return;
  }
  if (e.target.id==='cmpInput'){
    if (e.key==='Enter' && !e.shiftKey){ e.preventDefault(); send(); }
    return;
  }
  const inField = /^(input|textarea|select)$/i.test(e.target.tagName) || e.target.isContentEditable;
  const overlayOpen = OV.children.length || document.querySelector('.lightbox, .call, .jn, .set');
  if (!inField && !overlayOpen && !e.metaKey && !e.ctrlKey && !e.altKey){
    const k=e.key.toLowerCase();
    if (k==='j'){ e.preventDefault(); navChat(1); return; }
    if (k==='k'){ e.preventDefault(); navChat(-1); return; }
    if (e.key==='/'){ e.preventDefault(); cmdk(); return; }
    if (e.key==='?'){ e.preventDefault(); shortcutsOverlay(); return; }
  }
});
document.addEventListener('input', e=>{
  if(e.target.id==='cmpInput'){ e.target.style.height='auto'; e.target.style.height=Math.min(168,e.target.scrollHeight)+'px'; const bar=e.target.closest('.cmp__bar'); if(bar) bar.classList.toggle('has-text', !!e.target.value.trim()); }
  if(e.target.id==='csIn'){ S.csearch=e.target.value; const c=findChat(S.chatId); const sc=$('#scroll'); if(sc)sc.innerHTML=renderMessages(c); updateCSCount(); }
});

function chatHeaderMenu(x,y){
  popover(`<div class="menu" style="min-width:210px">
    <button class="menu__item" data-openinfo>${ic('info','icon--sm')} Информация</button>
    <button class="menu__item" data-chatsearch>${ic('search','icon--sm')} Поиск в чате</button>
    <button class="menu__item" data-infomute>${ic('mute','icon--sm')} Уведомления</button>
    <button class="menu__item" data-hint="Чат закреплён вверху">${ic('pin','icon--sm')} Закрепить чат</button>
    <div class="menu__sep"></div>
    <button class="menu__item menu__item--danger" data-hint="История очищена">${ic('trash','icon--sm')} Очистить историю</button>
  </div>`, x, y);
}
function attachMenu(x,y){
  popover(`<div class="menu" style="min-width:190px">
    <button class="menu__item">${ic('image','icon--sm')} Фото или видео</button>
    <button class="menu__item">${ic('file','icon--sm')} Документ</button>
    <button class="menu__item">${ic('poll','icon--sm')} Опрос</button>
    <button class="menu__item">${ic('users','icon--sm')} Контакт</button>
    <button class="menu__item">${ic('map','icon--sm')} Геопозиция</button>
  </div>`, x, y-260);
  OV.addEventListener('click',e=>{ const it=e.target.closest('.menu__item'); if(!it) return; const label=it.textContent.trim(); closeOverlays();
    if(/Фото/.test(label)){ photoPreview(); return; }
    if(/Опрос/.test(label)){ pollCreateModal(); return; }
    const c=findChat(S.chatId); if(!c) return; const th=MSGS[c.id]=threadOf(c).slice();
    if(/Документ/.test(label)){ th.push({id:'m'+uid(),from:'me',t:nowT(),file:{name:'Бриф.pdf',size:'2,4 МБ'},read:false}); c.last={by:'me',txt:'📎 Бриф.pdf',t:nowT(),read:false}; }
    else { toast(label+' — в полной версии'); return; }
    renderConversation(); renderList(); const _sc=$('#scroll'); if(_sc) _sc.lastElementChild?.classList.add('msg-in'); toast('Отправлено');
  });
}
/* photo preview before send */
function photoPreview(){
  const idx = Math.floor(Math.random()*PHOTOS.length);
  modal(`<div class="modal__header"><div class="modal__title">Отправить фото</div><button class="modal__close" data-close>✕</button></div>
    <div class="modal__body"><div style="background:${photoBg(idx)};aspect-ratio:4/3;border-radius:var(--radius-lg);margin-bottom:14px;box-shadow:var(--shadow-soft)"></div>
      <input class="input" id="phcap" placeholder="Добавить подпись…"></div>
    <div class="modal__footer"><button class="btn btn--ghost btn--md" data-close>Отмена</button><button class="btn btn--primary btn--md" data-phsend data-idx="${idx}">${ic('send','icon--sm')} Отправить</button></div>`,'md');
  const inp=$('#phcap'); if(inp) inp.focus();
  OV.addEventListener('click',e=>{ const b=e.target.closest('[data-phsend]'); if(!b) return; const cap=($('#phcap')?.value||'').trim(); const c=findChat(S.chatId); if(!c){closeOverlays();return;}
    const th=MSGS[c.id]=threadOf(c).slice(); th.push({id:'m'+uid(),from:'me',t:nowT(),media:{photo:+b.dataset.idx},cap,read:false}); c.last={by:'me',txt:'📷 Фото'+(cap?' · '+cap:''),t:nowT(),read:false};
    closeOverlays(); renderConversation(); renderList(); const _sc=$('#scroll'); if(_sc)_sc.lastElementChild?.classList.add('msg-in');
  });
}

/* ─────────────────────────── SETTINGS ─────────────────────────── */
const PERSONAS = [['','#7A5340','Суть'],['pair','#C77A8A','Пара'],['growth','#5C7E5A','Рост'],['quiet','#6B6E8E','Тишина'],['tide','#4A7B92','Прилив'],['ember','#B8623E','Уголь']];
function curTheme(){ const ls=localStorage.getItem('the-essence:theme'); return ls==='dark'?'dark':ls==='light'?'light':'system'; }
function seg(name, opts, cur){ return `<div class="segmented" data-seg="${name}">${opts.map(o=>`<label class="segmented__option${o[0]===cur?' segmented__option--active':''}" data-seg-val="${o[0]}">${o[1]}</label>`).join('')}</div>`; }
function toggleRow(t,d,on){ return `<div class="set__item"><div class="set__item-b"><div class="set__item-t">${t}</div>${d?`<div class="set__item-d">${d}</div>`:''}</div><label class="toggle"><input type="checkbox" class="toggle__input" ${on?'checked':''}><span class="toggle__track"><span class="toggle__thumb"></span></span></label></div>`; }
function selectRow(t,d,opts){ return `<div class="set__item"><div class="set__item-b"><div class="set__item-t">${t}</div>${d?`<div class="set__item-d">${d}</div>`:''}</div><select class="select" style="width:150px;flex:none">${opts.map(o=>`<option>${o}</option>`).join('')}</select></div>`; }

function settingsSection(sec){
  if (sec==='profile'){
    return `<div class="set__h">Профиль</div><div class="set__sub">Как тебя видят другие участники.</div>
      <div class="set__profile"><div class="set__avwrap">${AVATAR({...U.me,pr:null})}<button class="set__avedit" data-avedit title="Сменить фото">${ic('camera','icon--sm')}</button></div>
        <div><div class="set__item-t" style="font-size:19px;font-family:var(--font-display)">Юрий Сёмин</div><div class="set__item-d" style="font-size:13px">@yuri · Основатель · во всех организациях</div>
        <button class="btn btn--secondary btn--sm" style="margin-top:10px" data-avedit>Сменить фото</button></div></div>
      <div class="set__card">
        <div class="set__item"><div class="set__item-b"><div class="set__item-d">Имя</div><div class="set__item-t">Юрий Сёмин</div></div>${ic('pen','icon--sm')}</div>
        <div class="set__item"><div class="set__item-b"><div class="set__item-d">Имя пользователя</div><div class="set__item-t">@yuri</div></div>${ic('pen','icon--sm')}</div>
        <div class="set__item"><div class="set__item-b"><div class="set__item-d">О себе</div><div class="set__item-t">Строю экосистему «Суть» ✨</div></div>${ic('pen','icon--sm')}</div>
        <div class="set__item"><div class="set__item-b"><div class="set__item-d">Телефон</div><div class="set__item-t">+7 905 •••‑00‑01</div></div>${ic('lock','icon--sm')}</div>
      </div>`;
  }
  if (sec==='appearance'){
    const p = document.documentElement.getAttribute('data-persona')||'';
    const d = document.documentElement.getAttribute('data-density')||'comfortable';
    return `<div class="set__h">Оформление</div><div class="set__sub">Тема, акцент и плотность — применяются сразу.</div>
      <div class="set__group"><div class="set__grouph">Тема</div><div class="set__card"><div class="set__item"><div class="set__item-b"><div class="set__item-t">Оформление</div><div class="set__item-d">Тёмная тема тёплая, не серая.</div></div>${seg('theme',[['light','Светлая'],['dark','Тёмная'],['system','Системная']],curTheme())}</div></div></div>
      <div class="set__group"><div class="set__grouph">Акцент</div><div class="set__card"><div class="set__item"><div class="set__item-b"><div class="set__item-t">Цвет акцента</div><div class="set__item-d">Персональная палитра поверх бренда.</div></div>
        <div class="set__swatches">${PERSONAS.map(pp=>`<button class="set__swatch${pp[0]===p?' is-active':''}" data-persona-set="${pp[0]}" style="background:${pp[1]}" title="${pp[2]}"></button>`).join('')}</div></div></div></div>
      <div class="set__group"><div class="set__grouph">Плотность и текст</div><div class="set__card">
        <div class="set__item"><div class="set__item-b"><div class="set__item-t">Плотность</div><div class="set__item-d">Высота строк и отступы.</div></div>${seg('density',[['compact','Компактно'],['comfortable','Обычно'],['spacious','Просторно']],d)}</div>
        <div class="set__item"><div class="set__item-b"><div class="set__item-t">Размер текста</div></div>${seg('textsize',[['s','А'],['m','А'],['l','А']],'m')}</div>
      </div></div>`;
  }
  if (sec==='notifications'){
    return `<div class="set__h">Уведомления</div><div class="set__sub">Что и как тебе приходит.</div>
      <div class="set__group"><div class="set__grouph">Каналы</div><div class="set__card">
        ${toggleRow('Личные сообщения','',true)}${toggleRow('Группы','Только упоминания и ответы',true)}${toggleRow('Каналы','',false)}${toggleRow('Реакции на мои сообщения','',true)}
      </div></div>
      <div class="set__group"><div class="set__grouph">Как</div><div class="set__card">
        ${toggleRow('Звук','',true)}${toggleRow('Превью текста','Показывать текст в уведомлении',true)}${toggleRow('Вибрация','',true)}
      </div></div>
      <div class="set__group"><div class="set__grouph">Не беспокоить</div><div class="set__card">
        ${toggleRow('Тихие часы','С 22:00 до 8:00 — без звука',true)}
      </div></div>`;
  }
  if (sec==='privacy'){
    return `<div class="set__h">Приватность</div><div class="set__sub">Кто и что о тебе видит.</div>
      <div class="set__group"><div class="set__grouph">Кто видит</div><div class="set__card">
        ${selectRow('Номер телефона','',['Мои контакты','Все','Никто'])}
        ${selectRow('Фото профиля','',['Все','Мои контакты','Никто'])}
        ${selectRow('«Был(а) в сети»','',['Мои контакты','Все','Никто'])}
      </div></div>
      <div class="set__group"><div class="set__grouph">Кто может</div><div class="set__card">
        ${selectRow('Добавлять меня в группы','',['Мои контакты','Все','Никто'])}
        ${selectRow('Звонить мне','',['Все','Мои контакты','Никто'])}
      </div></div>
      <div class="set__group"><div class="set__grouph">Сообщения</div><div class="set__card">
        ${toggleRow('Отправлять «Прочитано»','Если выключить — ты тоже не видишь чужие',true)}
        <div class="set__item"><div class="set__item-b"><div class="set__item-t">Заблокированные</div><div class="set__item-d">Никого</div></div>${ic('chev-r','icon--sm')}</div>
      </div></div>`;
  }
  if (sec==='devices'){
    return `<div class="set__h">Устройства</div><div class="set__sub">Активные сеансы.</div>
      <div class="set__card">
        <div class="set__item"><span class="info__act-ic" style="background:var(--color-success-soft);color:var(--color-success-text)">${ic('globe','icon--sm')}</span><div class="set__item-b"><div class="set__item-t">Chrome · macOS · этот компьютер</div><div class="set__item-d">Самара · сейчас онлайн</div></div></div>
        <div class="set__item"><span class="info__act-ic">${ic('message','icon--sm')}</span><div class="set__item-b"><div class="set__item-t">iPhone · Суть Чат</div><div class="set__item-d">был онлайн 2 ч назад</div></div><button class="btn btn--ghost btn--sm">Выйти</button></div>
      </div>
      <button class="btn btn--outline btn--md" style="margin-top:16px;color:var(--color-danger-text);border-color:var(--color-danger-soft)">Завершить все другие сеансы</button>`;
  }
  if (sec==='orgs'){
    return `<div class="set__h">Организации</div><div class="set__sub">Рабочие пространства, где ты состоишь.</div>
      <div class="set__card">
        ${Object.entries(ORGS).map(([id,o])=>`<div class="set__item"><span class="chat-ws__logo" style="width:38px;height:38px">${esc(o.logo)}</span><div class="set__item-b"><div class="set__item-t">${esc(o.name)}</div><div class="set__item-d">${id==='sut'?'Владелец':id==='personal'?'Личное пространство':'Администратор'}</div></div>${id!=='personal'?`<button class="btn btn--ghost btn--sm">Выйти</button>`:''}</div>`).join('')}
      </div>
      <button class="btn btn--secondary btn--md" style="margin-top:16px">${ic('plus','icon--sm')} Создать организацию</button>`;
  }
  return '';
}
function renderSettings(sec){
  sec = sec || 'appearance';
  const app=$('.chat-app'); if(app) app.style.display='none';
  let wrap=$('.set'); if(!wrap){ wrap=document.createElement('div'); wrap.className='set'; document.body.appendChild(wrap); }
  const NAV=[['profile','Профиль','users'],['appearance','Оформление','sun'],['notifications','Уведомления','bell'],['privacy','Приватность','lock'],['devices','Устройства','globe'],['orgs','Организации','shield']];
  wrap.innerHTML = `<div class="set__top"><button class="shell-icon-btn" data-set-close>${ic('back')}</button><div class="set__title">Настройки</div>
      <button class="shell-icon-btn" id="setTheme" title="Тема"><svg class="icon shell-icon-btn__sun"><use href="#i-sun"/></svg><svg class="icon shell-icon-btn__moon"><use href="#i-moon"/></svg></button></div>
    <div class="set__wrap"><div class="set__inner">
      <nav class="set__nav">${NAV.map(n=>`<button class="set__navitem${n[0]===sec?' is-active':''}" data-set-nav="${n[0]}">${ic(n[2],'icon--sm')}<span>${n[1]}</span></button>`).join('')}</nav>
      <div class="set__content" id="setContent">${settingsSection(sec)}</div>
    </div></div>`;
  wrap.onclick = e=>{
    if (e.target.closest('[data-set-close]')){ wrap.remove(); if(app) app.style.display=''; history.replaceState(null,'','?'); return; }
    if (e.target.closest('#setTheme')){ toggleTheme(); return; }
    const nav=e.target.closest('[data-set-nav]'); if(nav){ $$('.set__navitem',wrap).forEach(x=>x.classList.remove('is-active')); nav.classList.add('is-active'); $('#setContent',wrap).innerHTML=settingsSection(nav.dataset.setNav); return; }
    const sv=e.target.closest('[data-seg-val]'); if(sv){ const seg=sv.closest('[data-seg]').dataset.seg; applySetting(seg, sv.dataset.segVal); $$('.segmented__option',sv.parentElement).forEach(x=>x.classList.remove('segmented__option--active')); sv.classList.add('segmented__option--active'); return; }
    const ps=e.target.closest('[data-persona-set]'); if(ps){ const v=ps.dataset.personaSet; if(v)document.documentElement.setAttribute('data-persona',v); else document.documentElement.removeAttribute('data-persona'); $$('.set__swatch',wrap).forEach(x=>x.classList.remove('is-active')); ps.classList.add('is-active'); return; }
    if (e.target.closest('[data-avedit]')){ avatarCropModal(); return; }
  };
}
function applySetting(kind,val){
  if (kind==='theme'){ const d=document.documentElement; if(val==='dark'){d.setAttribute('data-theme','dark');localStorage.setItem('the-essence:theme','dark');} else if(val==='light'){d.removeAttribute('data-theme');localStorage.setItem('the-essence:theme','light');} else {localStorage.removeItem('the-essence:theme'); if(matchMedia('(prefers-color-scheme: dark)').matches)d.setAttribute('data-theme','dark');else d.removeAttribute('data-theme');} }
  else if (kind==='density'){ document.documentElement.setAttribute('data-density', val); }
}

/* ─────────────────────────── JOIN LANDING (invite by link) ─────────────────────────── */
function renderJoin(req){
  const app = $('.chat-app'); if (app) app.style.display = 'none';
  const spec = U.alena;
  const wrap = document.createElement('div'); wrap.className = 'jn';
  wrap.innerHTML = `
    <div class="jn__top">
      <div class="jn__brand"><span class="shell-topbar__mark"></span><span class="shell-topbar__name">Суть <span class="shell-topbar__x">✕</span> <span class="shell-topbar__module">Чат</span></span></div>
      <button class="shell-icon-btn" id="jnTheme" title="Тема"><svg class="icon shell-icon-btn__sun"><use href="#i-sun"/></svg><svg class="icon shell-icon-btn__moon"><use href="#i-moon"/></svg></button>
    </div>
    <div class="jn__card">
      <section class="jn__step" id="js-auth">
        <div class="jn__spec">${AVATAR(spec)}<div class="jn__spec-nm">${esc(spec.name)}</div><div class="jn__spec-role">${ic('sparkles','icon--sm')} Астролог-консультант · Суть</div></div>
        <div class="jn__eyebrow">Приглашение в чат</div>
        <div class="jn__title"><em>${esc(spec.name.split(' ')[0])}</em> зовёт тебя на связь</div>
        <div class="jn__lead">Здесь мы будем общаться по твоему разбору — в одном месте, без разных мессенджеров. Входи привычным способом.</div>
        <div class="jn__auth">
          <button class="jn__btn jn__btn--tg" data-auth>${ic('send')} Продолжить через Telegram</button>
          <button class="jn__btn jn__btn--vk" data-auth>${ic('message')} Продолжить через VK</button>
          <button class="jn__btn jn__btn--max" data-auth>${ic('globe')} Продолжить через MAX</button>
        </div>
        <div class="jn__foot">Нажимая «Продолжить», ты соглашаешься с <a href="#">офертой</a> и <a href="#">политикой конфиденциальности</a>.</div>
      </section>
      <section class="jn__step" id="js-natal" hidden>
        <div class="jn__eyebrow">Пара деталей для разбора</div>
        <div class="jn__title">Данные <em>рождения</em></div>
        <div class="jn__note">${ic('sparkles','icon--sm')} Нужны специалисту, чтобы построить натальную карту. Время и место можно уточнить позже.</div>
        <div class="jn__fields">
          <div class="field"><label class="field__label">Дата рождения</label><input class="input" type="text" placeholder="14 марта 1992"></div>
          <div class="jn__row2">
            <div class="field"><label class="field__label">Время</label><input class="input" type="text" placeholder="08:20"></div>
            <div class="field"><label class="field__label">Город</label><input class="input" type="text" placeholder="Самара"></div>
          </div>
        </div>
        <button class="jn__btn jn__btn--primary" data-natal-done style="margin-top:18px">Продолжить</button>
        <button class="jn__skip" data-skip>Не знаю время / заполню позже — войти упрощённо</button>
      </section>
      <section class="jn__step" id="js-done" hidden>
        <div class="jn__ok">
          <div class="jn__ok-seal"><span class="jn__ok-check">${ic('check')}</span></div>
          <div class="jn__title">Готово — <em>ты в чате</em></div>
          <div class="jn__lead">Аккаунт создан. Всё общение по разбору теперь в одном месте.</div>
          <a class="jn__btn jn__btn--primary" href="index.html?chat=alena" style="text-decoration:none">Войти в чат →</a>
        </div>
      </section>
    </div>`;
  document.body.appendChild(wrap);
  const show = id => { $$('.jn__step', wrap).forEach(s => s.hidden = true); $('#'+id, wrap).hidden = false; wrap.scrollTop = 0; };
  wrap.addEventListener('click', e => {
    if (e.target.closest('#jnTheme')) return toggleTheme();
    if (e.target.closest('[data-auth]')) return show(req ? 'js-natal' : 'js-done');
    if (e.target.closest('[data-natal-done]') || e.target.closest('[data-skip]')) return show('js-done');
  });
  const _st = P.get('step');
  if (_st==='natal' && req) show('js-natal'); else if (_st==='done') show('js-done');
}

/* ─────────────────────────── BOOT ─────────────────────────── */
function boot(){
  for(const cid in MSGS) MSGS[cid].forEach((m,i)=>{ if(!m.id) m.id='m'+i; });
  if (S.org!=='all' && !ORGS[S.org]) { S.org='sut'; localStorage.setItem('sut-chat:org','sut'); document.documentElement.removeAttribute('data-org'); }
  if (P.get('view')==='join'){ renderJoin(P.get('req')!=='0'); return; }
  if (P.get('view')==='settings'){ renderAll(); renderSettings(P.get('sec')); return; }
  renderAll();
  if (S.chatId && findChat(S.chatId)) openChat(S.chatId);
  else if (innerWidth>900){ /* auto-open first chat on desktop for a full first impression */ openChat(chatsFor(S.org)[0].id); }
  if (P.get('call') && findChat(S.chatId)) callOverlay(S.chatId, P.get('call'));
}
boot();
