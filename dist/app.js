'use strict';

const ROOMS = Object.freeze({
  big: {name:'Большой зал',capacity:20,price:2500,nextPrice:2800,code:'01',badge:'Для большой компании',vibe:'Много места. Ещё больше поводов.',description:'Дни рождения, корпоративы, кино и танцы всей компанией. Большой диван, огромный экран и свет, который включает праздник.',equipment:['Большой комфортный диван, огромный экран, 3D-проектор','Dolby Surround 7.1 · 20 динамиков','Караоке · до 3 микрофонов','Лазерная светомузыка и стробоскоп','Xbox 360, Xbox One Kinect, PlayStation 4 и 5'],product:'https://vk.ru/market/product/bolshoy-zal-138779824-505350',photos:['big-01.webp','big-02.webp','big-03.webp','big-04.webp']},
  fantasy: {name:'Зал «Фантазия»',capacity:10,price:2200,nextPrice:2500,code:'02',badge:'С особым настроением',vibe:'Мягкий свет. Своя атмосфера.',description:'Уютный зал в сердце «Вегаса». Настройте яркость ламп над столом, устройтесь на диване или в подвесном кресле зелёного уголка.',equipment:['Уютный диван, большой экран, 3D-проектор','Dolby Surround 5.1 · 14 динамиков','Караоке · до 2 микрофонов','Лазерная светомузыка и динамическое LED-освещение','Подвесное кресло; Xbox 360, Xbox One Kinect, PlayStation 4 и 5'],product:'https://vk.ru/market/product/zal-fantazia-138779824-5078087',photos:['fantasy-04.webp','fantasy-03.webp']},
  plus: {name:'Средний+ зал',capacity:12,price:2200,nextPrice:2500,code:'03',badge:'Для дружной компании',vibe:'Больше друзей. Больше историй.',description:'Чуть просторнее Среднего. Два дивана, большой экран и насыщенный звук — для шумной компании, которая собралась надолго.',equipment:['Два дивана и большой экран','Dolby Surround 7.1 · 18 динамиков','Караоке · до 2 микрофонов','Лазерная светомузыка','Xbox 360, Xbox One Kinect, PlayStation 4 и 5'],product:'https://vk.ru/market/product/sredniy-zal-138779824-2456838',photos:['plus-01.webp','plus-02.webp']},
  medium: {name:'Средний зал',capacity:10,price:2000,nextPrice:2200,code:'04',badge:'Для близкого круга',vibe:'Любимый фильм. Любимые люди.',description:'Для кино с друзьями, камерного дня рождения или небольшого корпоратива. Уютный диван, большой экран и звук вокруг.',equipment:['Уютный диван, большой экран, 3D-проектор','Dolby Surround 5.1 · 16 динамиков','Караоке · до 2 микрофонов','Лазерная светомузыка','Xbox 360, Xbox One Kinect, PlayStation 4 и 5'],product:'https://vk.ru/market/product/sredniy-zal-138779824-505348',photos:['medium-02.webp','medium-05.webp','medium-01.webp','medium-03.webp','medium-04.webp']},
  small: {name:'Малый зал',capacity:5,price:1500,nextPrice:1800,code:'05',badge:'Для камерного вечера',vibe:'Ближе друг к другу.',description:'Самый камерный зал «Вегаса»: свидание или встреча небольшой компании, где все рядом и экран только ваш.',equipment:['Уютный диван, большой экран, 3D-проектор','Dolby Surround 5.1 · 14 динамиков','Караоке · до 2 микрофонов','Xbox 360, Xbox One Kinect, PlayStation 4 и 5'],product:'https://vk.ru/market/product/maly-zal-138779824-505346',photos:['small-01.webp']}
});
const ROMANTIC=Object.freeze({name:'Романтический вечер',capacity:2,price:9000,code:'06',description:'Три часа вдвоём в Малом зале. Отдельное предложение для свидания, которое хочется запомнить.',equipment:['Три часа в Малом зале','Бутылка шампанского','Свечи и лепестки роз','Фруктовая ваза'],product:'https://vk.ru/market/product/romanticheskiy-vecher-138779824-566867',photos:['romantic-01.webp']});
const CATALOG=Object.freeze({...ROOMS,romantic:ROMANTIC});
const PRICE_CHANGE_DATE='2026-12-10';
const money = value => new Intl.NumberFormat('ru-RU').format(value) + ' ₽';
function moscowToday(){
  const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Moscow',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
  const get=type=>parts.find(part=>part.type===type).value;
  return `${get('year')}-${get('month')}-${get('day')}`;
}
function rateFor(room,date){return date>=PRICE_CHANGE_DATE?room.nextPrice:room.price;}
function estimateFor(roomKey,date,hours){
  if(!Object.hasOwn(ROOMS,roomKey)||!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isInteger(hours)||hours<2||hours>6) return null;
  const room=ROOMS[roomKey]; const rate=rateFor(room,date);
  return {room,rate,total:rate*hours,hours,date};
}
function formatDate(date){return new Intl.DateTimeFormat('ru-RU',{day:'numeric',month:'long',year:'numeric',timeZone:'Europe/Moscow'}).format(new Date(`${date}T12:00:00+03:00`));}

function init(){
  const $=id=>document.getElementById(id);
  const premiere=$('top');
  $('replay-intro').addEventListener('click',()=>{
    if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    premiere.classList.add('intro-reset');
    // Flush the reset so the same CSS timeline can play again, without cloning DOM.
    void premiere.offsetWidth;
    premiere.classList.remove('intro-reset');
  });
  const roomField=$('booking-room'),dateField=$('booking-date'),hoursField=$('booking-hours');
  dateField.min=moscowToday();dateField.value=moscowToday();
  const tabs=[...document.querySelectorAll('.room-choice[role="tab"]')];
  const showcase=$('room-showcase');
  let selectedKey='big';
  function renderShowcasePhoto(){
    const item=CATALOG[selectedKey],index=Number(showcase.dataset.photoIndex||0);
    $('showcase-image').src=`./assets/rooms/${item.photos[index]}`;
    $('showcase-image').alt=`${item.name}: фотография из карточки ВКонтакте`;
    $('showcase-photo-count').textContent=`${String(index+1).padStart(2,'0')} / ${String(item.photos.length).padStart(2,'0')}`;
    $('showcase-prev').hidden=item.photos.length<2;$('showcase-next').hidden=item.photos.length<2;
  }
  function selectCatalog(key,focusTab=false){
    if(!Object.hasOwn(CATALOG,key))return;
    selectedKey=key;const item=CATALOG[key],romantic=key==='romantic';
    tabs.forEach(tab=>{const active=tab.dataset.selectRoom===key;tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;if(active&&focusTab)tab.focus();});
    showcase.setAttribute('aria-labelledby',`room-tab-${key}`);
    showcase.dataset.currentRoom=key;showcase.dataset.photoIndex='0';
    $('showcase-code').textContent=romantic?'ОСОБЕННЫЙ ПОВОД':`ЗАЛ ${item.code} / 05`;
    $('showcase-capacity').textContent=romantic?'ДЛЯ ДВОИХ · 3 ЧАСА':`ДО ${item.capacity} ГОСТЕЙ`;
    $('showcase-title').textContent=item.name;
    $('showcase-description').textContent=item.description;
    $('showcase-equipment-label').textContent=romantic?'В ПРЕДЛОЖЕНИИ':'В ЗАЛЕ';
    $('showcase-equipment').replaceChildren(...item.equipment.map(value=>{const li=document.createElement('li');li.textContent=value;return li;}));
    $('showcase-price').textContent=money(romantic?item.price:rateFor(item,moscowToday()));
    $('showcase-unit').textContent=romantic?'/ за пакет':'/ час за весь зал';
    $('showcase-next-price').textContent=romantic?'В описании Малого зала также упомянут пакет от 7 000 ₽ — уточните условия.':moscowToday()<PRICE_CHANGE_DATE?`С 10 декабря 2026 — ${money(item.nextPrice)}/час`:'Тариф с 10 декабря 2026 года';
    $('showcase-book').textContent=romantic?'Уточнить предложение':'Выбрать зал';
    const arrow=document.createElementNS('http://www.w3.org/2000/svg','svg');const use=document.createElementNS('http://www.w3.org/2000/svg','use');use.setAttribute('href','#i-up');arrow.append(use);$('showcase-book').append(arrow);
    $('showcase-book').href=romantic?item.product:'#booking';
    if(romantic){$('showcase-book').target='_blank';$('showcase-book').rel='noopener noreferrer';}else{$('showcase-book').removeAttribute('target');$('showcase-book').removeAttribute('rel');}
    $('showcase-source').href=item.product;
    $('showcase-photo-open').dataset.roomPhoto=key;
    $('showcase-photo-open').setAttribute('aria-label',`Увеличить фотографию: ${item.name}`);
    tabs.find(tab=>tab.dataset.selectRoom===key).querySelector('.room-choice-price').textContent=romantic?`${money(item.price)} / пакет`:`от ${money(rateFor(item,moscowToday()))} / час`;
    renderShowcasePhoto();
  }
  tabs.forEach((tab,index)=>{
    tab.addEventListener('click',()=>selectCatalog(tab.dataset.selectRoom));
    tab.addEventListener('keydown',event=>{
      let next=index;
      if(event.key==='ArrowRight')next=(index+1)%tabs.length;
      else if(event.key==='ArrowLeft')next=(index-1+tabs.length)%tabs.length;
      else if(event.key==='Home')next=0;
      else if(event.key==='End')next=tabs.length-1;
      else return;
      event.preventDefault();selectCatalog(tabs[next].dataset.selectRoom,true);
    });
  });
  tabs.forEach(tab=>{const key=tab.dataset.selectRoom;if(key!=='romantic')tab.querySelector('.room-choice-price').textContent=`от ${money(rateFor(ROOMS[key],moscowToday()))} / час`;});
  $('showcase-prev').addEventListener('click',()=>{const count=CATALOG[selectedKey].photos.length;showcase.dataset.photoIndex=String((Number(showcase.dataset.photoIndex)-1+count)%count);renderShowcasePhoto();});
  $('showcase-next').addEventListener('click',()=>{const count=CATALOG[selectedKey].photos.length;showcase.dataset.photoIndex=String((Number(showcase.dataset.photoIndex)+1)%count);renderShowcasePhoto();});
  selectCatalog('big');

  function updateEstimate(){
    const estimate=estimateFor(roomField.value,dateField.value,Number(hoursField.value));
    if(!estimate){$('estimate-price').textContent='Выберите дату';$('estimate-detail').textContent='';return;}
    $('estimate-price').textContent=money(estimate.total);
    const unit=estimate.hours<5?'часа':'часов';
    $('estimate-detail').textContent=`${estimate.hours} ${unit} × ${money(estimate.rate)}`;
  }
  [roomField,dateField,hoursField].forEach(field=>field.addEventListener('change',updateEstimate));
  dateField.addEventListener('input',updateEstimate);
  updateEstimate();
  $('showcase-book').addEventListener('click',event=>{
    if(selectedKey==='romantic')return;
    event.preventDefault();roomField.value=selectedKey;updateEstimate();
    $('booking').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
    roomField.focus({preventScroll:true});
  });

  let dialogOpener=null;
  function showDialog(dialog){
    dialogOpener=document.activeElement;
    dialog.showModal();document.body.classList.add('modal-open');
    dialog.querySelector('.dialog-close')?.focus();
  }
  document.querySelectorAll('dialog').forEach(dialog=>{
    dialog.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());
    dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
    dialog.addEventListener('close',()=>{document.body.classList.remove('modal-open');if(dialogOpener?.isConnected)dialogOpener.focus({preventScroll:true});if(dialog===$('photo-dialog'))$('expanded-photo').removeAttribute('src');});
  });
  $('booking-form').addEventListener('submit',event=>{
    event.preventDefault();dateField.min=moscowToday();dateField.setCustomValidity('');
    if(dateField.value<dateField.min){dateField.setCustomValidity('Выберите сегодняшнюю или будущую дату.');dateField.reportValidity();return;}
    if(!event.currentTarget.reportValidity())return;
    const estimate=estimateFor(roomField.value,dateField.value,Number(hoursField.value));if(!estimate)return;
    $('booking-message').value=`Здравствуйте! Хотим забронировать ${estimate.room.name.toLowerCase()} в «Вегасе».\n\nДата: ${formatDate(estimate.date)}\nДлительность: ${estimate.hours} ч.\nПредварительный расчёт аренды: ${money(estimate.total)} (${money(estimate.rate)}/час).\n\nПодскажите, пожалуйста, свободное время и подтвердите стоимость. Количество гостей и время начала согласуем.`;
    $('copy-status').textContent='';$('copy-message').textContent='Скопировать сообщение';
    showDialog($('booking-dialog'));
  });
  dateField.addEventListener('input',()=>dateField.setCustomValidity(''));
  $('copy-message').addEventListener('click',async()=>{
    try{if(!navigator.clipboard?.writeText)throw Error('Clipboard unavailable');await navigator.clipboard.writeText($('booking-message').value);$('copy-message').textContent='Сообщение скопировано ✓';$('copy-status').textContent='Теперь откройте ВК и вставьте текст в диалог.';}
    catch{$('booking-message').focus();$('booking-message').select();$('copy-status').textContent='Текст выделен. Нажмите Ctrl+C или выберите «Копировать» на телефоне.';}
  });

  const photos={party:{src:'./assets/guests-party.jpg',alt:'Праздник с друзьями в кинокафе Вегас'},friends:{src:'./assets/guests-friends.jpg',alt:'Компания друзей в кинокафе Вегас'},holiday:{src:'./assets/guests-holiday.jpg',alt:'Костюмированный праздник в кинокафе Вегас'}};
  document.querySelectorAll('.photo-open').forEach(button=>button.addEventListener('click',()=>{
    let photo=photos[button.dataset.photo];
    if(!photo&&button.dataset.roomPhoto){const key=button.dataset.roomPhoto;if(!Object.hasOwn(CATALOG,key))return;const index=Number(showcase.dataset.photoIndex||0);photo={src:`./assets/rooms/${CATALOG[key].photos[index]}`,alt:`${CATALOG[key].name} · фото из карточки ВК`};}
    if(!photo)return;
    $('expanded-photo').src=photo.src;$('expanded-photo').alt=photo.alt;$('photo-caption').textContent=photo.alt;showDialog($('photo-dialog'));
  }));
  $('privacy-button').addEventListener('click',()=>showDialog($('privacy-dialog')));
  const menuButton=document.querySelector('.menu-toggle'),mobileNav=$('mobile-nav');
  const closeMenu=()=>{mobileNav.hidden=true;menuButton.setAttribute('aria-expanded','false');menuButton.setAttribute('aria-label','Открыть меню');};
  menuButton.addEventListener('click',()=>{const open=menuButton.getAttribute('aria-expanded')!=='true';mobileNav.hidden=!open;menuButton.setAttribute('aria-expanded',String(open));menuButton.setAttribute('aria-label',open?'Закрыть меню':'Открыть меню');});
  mobileNav.querySelectorAll('a').forEach(link=>link.addEventListener('click',closeMenu));
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!mobileNav.hidden){closeMenu();menuButton.focus();}});
  matchMedia('(min-width: 681px)').addEventListener('change',event=>{if(event.matches)closeMenu();});
  if('IntersectionObserver' in window&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('reveal-ready');observer.unobserve(entry.target);}}),{threshold:.12});
    document.querySelectorAll('.intro-body,.section-heading,.activity,.food-banner,.moment-note').forEach(el=>observer.observe(el));
  }
}
if(typeof document!=='undefined')init();
// Pure calculations are also checked directly by the local verification script.
if(typeof module!=='undefined')module.exports={ROOMS,ROMANTIC,CATALOG,PRICE_CHANGE_DATE,rateFor,estimateFor,formatDate};
