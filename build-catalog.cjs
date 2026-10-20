'use strict';
// The first room and all choices render before JavaScript loads. app.js owns the facts.
const fs=require('node:fs');
const {ROOMS}=require('./dist/app.js');
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=n=>new Intl.NumberFormat('ru-RU').format(n)+' ₽';
const names={big:'Большой',fantasy:'Фантазия',plus:'Средний+',medium:'Средний',small:'Малый'};
const tabs=Object.entries(ROOMS).map(([key,room],index)=>`<button type="button" class="room-choice" id="room-tab-${key}" role="tab" aria-controls="room-showcase" aria-selected="${index===0}" tabindex="${index===0?'0':'-1'}" data-select-room="${key}"><span class="room-choice-top">ЗАЛ ${room.code} <span>ДО ${room.capacity}</span></span><strong>${escape(names[key])}</strong><span class="room-choice-price">от ${money(room.price)} / час</span></button>`).join('');
const romanticTab=`<button type="button" class="room-choice room-choice-special" id="room-tab-romantic" role="tab" aria-controls="room-showcase" aria-selected="false" tabindex="-1" data-select-room="romantic"><span class="room-choice-top">ПАКЕТ <span>3 ЧАСА</span></span><strong>Романтика</strong><span class="room-choice-price">9 000 ₽ / пакет</span></button>`;
const first=ROOMS.big;
const equipment=first.equipment.map(item=>`<li>${escape(item)}</li>`).join('');
const rooms=`<section class="rooms-section section-space" id="rooms" aria-labelledby="rooms-title">
  <div class="wrap"><div class="section-heading"><div><p class="eyebrow">02 / ЗАЛЫ И ЦЕНЫ</p><h2 id="rooms-title">ВЫБЕРИТЕ<br><span>СВОЙ ВЕЧЕР.</span></h2></div><p>Пять отдельных залов и предложение для свидания.<br><strong>Цены — за весь зал, не за человека.</strong></p></div>
    <div class="room-selector" role="tablist" aria-label="Выберите зал или предложение">${tabs}${romanticTab}</div>
    <div class="room-showcase" id="room-showcase" role="tabpanel" aria-labelledby="room-tab-big" data-current-room="big" data-photo-index="0" tabindex="0">
      <div class="showcase-visual"><button class="photo-open showcase-photo" id="showcase-photo-open" type="button" data-room-photo="big" aria-label="Увеличить фотографию Большого зала"><img id="showcase-image" src="./assets/rooms/${first.photos[0]}" width="900" height="700" alt="Большой зал: фотография из карточки ВКонтакте"></button><span class="showcase-photo-label">НАСТОЯЩИЕ ЗАЛЫ ВЕГАСА</span><div class="showcase-photo-controls"><span id="showcase-photo-count">01 / 04</span><button type="button" id="showcase-prev" aria-label="Предыдущая фотография"><svg><use href="#i-arrow"/></svg></button><button type="button" id="showcase-next" aria-label="Следующая фотография"><svg><use href="#i-arrow"/></svg></button></div></div>
      <div class="showcase-content"><div class="showcase-overline"><span id="showcase-code">ЗАЛ 01 / 05</span><span id="showcase-capacity">ДО 20 ГОСТЕЙ</span></div><h3 id="showcase-title">Большой зал</h3><p class="showcase-description" id="showcase-description">${escape(first.description)}</p><p class="showcase-equipment-label" id="showcase-equipment-label">В ЗАЛЕ</p><ul class="showcase-equipment" id="showcase-equipment">${equipment}</ul><div class="showcase-bottom"><div class="showcase-price"><strong id="showcase-price">${money(first.price)}</strong><span id="showcase-unit">/ час за весь зал</span><small id="showcase-next-price">С 10 декабря 2026 — ${money(first.nextPrice)}/час</small></div><a class="showcase-book" id="showcase-book" href="#booking">Выбрать зал <svg><use href="#i-up"/></svg></a></div><a class="showcase-source" id="showcase-source" href="${first.product}" target="_blank" rel="noopener noreferrer">Карточка товара в ВК <svg><use href="#i-up"/></svg></a></div>
    </div>
    <p class="rooms-note">Фотографии, оснащение и цены — из <a href="https://vk.ru/market-138779824" target="_blank" rel="noopener noreferrer">каталога сообщества ВК</a>. Свободное время и итоговую стоимость подтвердит администратор.</p>
    <noscript><p>Для просмотра остальных залов включите JavaScript или откройте <a href="https://vk.ru/market-138779824">каталог ВК</a>.</p></noscript>
  </div>
</section>`;
const file='dist/index.html';let html=fs.readFileSync(file,'utf8');
html=html.replace(/<section class="rooms-section section-space"[\s\S]*?<\/section>/,rooms);
html=html.replace(/\s*<section class="romantic-section"[\s\S]*?<\/section>/,'');
fs.writeFileSync(file,html);
console.log('Generated compact selector for five rooms and romantic package');
