(function(){
  const state = { selected_booking: null };

  function q(sel){return document.querySelector(sel)}
  function qa(sel){return Array.from(document.querySelectorAll(sel))}

  function setLanguage(lang){
    qa('[data-sv]').forEach(el=>{
      const sv = el.getAttribute('data-sv');
      const en = el.getAttribute('data-en');
      if(!sv && !en) return;
      el.textContent = (lang==='en' ? (en||sv) : (sv||en));
    });
  }

  function initLang(){
    const savedLang = localStorage.getItem('lang') || 'sv';
    setLanguage(savedLang);
    qa('.lang_btn_global').forEach(btn=>{
      btn.classList.toggle('active_global', btn.getAttribute('data-lang') === savedLang);
      btn.addEventListener('click',()=>{
        const lang = btn.getAttribute('data-lang')||'sv';
        setLanguage(lang);
        localStorage.setItem('lang', lang);
        qa('.lang_btn_global').forEach(b=>b.classList.toggle('active_global', b===btn));
      });
    });
  }

  function buildCalendar(container, year = new Date().getFullYear(), month = new Date().getMonth()){
    if(!container) return;
    const first = new Date(year, month, 1);
    const daysInMonth = new Date(year, month+1, 0).getDate();

    const heading = document.createElement('div');
    heading.className = 'calendar_header_booking';
    heading.innerHTML = `
      <button class="calendar_nav_booking" data-dir="-1" aria-label="Föregående månad">&larr;</button>
      <strong>${first.toLocaleString(navigator.language,{month:'long', year:'numeric'})}</strong>
      <button class="calendar_nav_booking" data-dir="1" aria-label="Nästa månad">&rarr;</button>
    `;

    const grid = document.createElement('div');
    grid.className = 'calendar_grid_booking';

    const weekDays = ['M','T','O','T','F','L','S'];
    weekDays.forEach(d=>{ const s=document.createElement('span'); s.textContent=d; grid.appendChild(s)});

    const offset = (first.getDay()+6)%7;
    for(let i=0;i<offset;i++){ const e=document.createElement('div'); grid.appendChild(e) }

    for(let d=1; d<=daysInMonth; d++){
      const dt = new Date(year,month,d);
      const btn = document.createElement('button');
      btn.type='button';
      btn.textContent = d;
      btn.dataset.date = dt.toISOString().slice(0,10);
      btn.setAttribute('aria-label', `Datum ${d} ${first.toLocaleString(navigator.language,{month:'long'})}`);

      const day = dt.getDay();
      const today = new Date();
      today.setHours(0,0,0,0);
      if(dt < today){ btn.classList.add('booked_booking'); btn.disabled=true; btn.setAttribute('aria-label', btn.getAttribute('aria-label') + ' - Förbi'); }
      else if(day===0 || day===6){ btn.classList.add('booked_booking'); btn.disabled=true; btn.setAttribute('aria-label', btn.getAttribute('aria-label') + ' - Bokat'); }
      else { btn.classList.add('available_booking'); btn.setAttribute('aria-label', btn.getAttribute('aria-label') + ' - Ledigt'); }

      btn.addEventListener('click', ()=> selectDate(btn));
      grid.appendChild(btn);
    }

    container.innerHTML='';
    container.appendChild(heading);
    container.appendChild(grid);

    qa('.calendar_nav_booking', container).forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const dir = parseInt(btn.dataset.dir);
        const newMonth = month + dir;
        let newYear = year;
        if(newMonth < 0){ newYear--; newMonth=11; }
        else if(newMonth > 11){ newYear++; newMonth=0; }
        buildCalendar(container, newYear, newMonth);
      });
    });
  }

  function selectDate(button){
    qa('.calendar_grid_booking button').forEach(b=>b.classList.remove('selected_booking'));
    button.classList.add('selected_booking');
    state.selected_booking = button.dataset.date;
    const selectedInput = q('#selectedDate');
    if(selectedInput) selectedInput.value = state.selected_booking;
  }

  function initBookingForm(){
    const form = q('#bookingForm');
    if(!form) return;
    form.addEventListener('submit', (e)=>{
      e.preventDefault();
      const name = q('#name').value.trim();
      const email = q('#email').value.trim();
      const date = q('#selectedDate').value.trim();
      const confirmation = q('#bookingConfirmation');
      if(!date){ confirmation.textContent = 'Välj ett datum först.'; return }
      if(!name || !email){ confirmation.textContent = 'Fyll i namn och e-post.'; return }

      confirmation.textContent = 'Tack! Din förfrågan är mottagen.';
      form.reset();
      state.selected_booking = null;
      qa('.calendar_grid_booking button.selected_booking').forEach(b=>b.classList.remove('selected_booking'));
    });
  }

  function initGallery(){
    const gallery = q('.gallery_grid_global');
    if(!gallery) return;
    const images = qa('.gallery_item_global img');
    let currentIndex = 0;

    const lightbox_global = document.createElement('div');
    lightbox_global.className = 'lightbox_global';
    lightbox_global.innerHTML = `
      <button class="lightbox_close_global" aria-label="Stäng">&times;</button>
      <button class="lightbox_prev_global" aria-label="Föregående bild">&larr;</button>
      <img src="" alt="">
      <button class="lightbox_next_global" aria-label="Nästa bild">&rarr;</button>
    `;
    document.body.appendChild(lightbox_global);

    const lbImg = lightbox_global.querySelector('img');
    const closeBtn = lightbox_global.querySelector('.lightbox_close_global');
    const prevBtn = lightbox_global.querySelector('.lightbox_prev_global');
    const nextBtn = lightbox_global.querySelector('.lightbox_next_global');

    function showImage(index){
      currentIndex = index;
      lbImg.src = images[index].src;
      lbImg.alt = images[index].alt;
      lightbox_global.classList.add('show');
      document.body.style.overflow = 'hidden';
    }

    function hideLightbox(){
      lightbox_global.classList.remove('show');
      document.body.style.overflow = '';
    }

    function nextImage(){
      currentIndex = (currentIndex + 1) % images.length;
      showImage(currentIndex);
    }

    function prevImage(){
      currentIndex = (currentIndex - 1 + images.length) % images.length;
      showImage(currentIndex);
    }

    images.forEach((img, index)=>{
      img.addEventListener('click', ()=> showImage(index));
      img.addEventListener('keydown', (e)=>{
        if(e.key === 'Enter' || e.key === ' ') showImage(index);
      });
      img.setAttribute('tabindex', '0');
    });

    closeBtn.addEventListener('click', hideLightbox);
    prevBtn.addEventListener('click', prevImage);
    nextBtn.addEventListener('click', nextImage);

    lightbox_global.addEventListener('click', (e)=>{
      if(e.target === lightbox_global) hideLightbox();
    });

    document.addEventListener('keydown', (e)=>{
      if(!lightbox_global.classList.contains('show')) return;
      if(e.key === 'Escape') hideLightbox();
      else if(e.key === 'ArrowRight') nextImage();
      else if(e.key === 'ArrowLeft') prevImage();
    });
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    initLang();
    setLanguage('sv');
    const cal = q('#calendarContainer');
    if(cal) buildCalendar(cal);
    initBookingForm();
    initGallery();
  });

})();
