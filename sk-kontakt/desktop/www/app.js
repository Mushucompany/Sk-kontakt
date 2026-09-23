// ===== СК Контакт — App =====
const app = {
  user: null,
  contacts: [],
  messages: {},
  currentChat: null,
  premium: false,
  allUsers: [],

  // ===== STICKER PACKS (статические) =====
  stickerPacks: [
    { id: 'smile', name: 'Смайлы', premium: false, stickers: ['😀','😁','😂','🤣','😊','😇','🙂','😉','😌','😍','🥰','😘','😎','🤩','🥳','😏','😜','🤪','😅','😆'] },
    { id: 'animals', name: 'Животные', premium: false, stickers: ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🐔','🐧','🐦','🦄','🐲'] },
    { id: 'food', name: 'Еда', premium: false, stickers: ['🍎','🍉','🍇','🍓','🍒','🍑','🥭','🍍','🥥','🥝','🍅','🥑','🥦','🌽','🍕','🍔','🌭','🍟','🍩','🍪'] },
    { id: 'emoji', name: 'Эмоции', premium: false, stickers: ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','💯','✨','🔥','⚡','💥','💫','🌟','⭐','🌈','🎉','🎊','👍'] },
    { id: 'sk', name: 'СК Exclusive', premium: true, stickers: ['👑','💎','🚀','🏆','🎯','🧠','💪','🛡️','⚔️','🗡️','🪄','🔮','💝','👾','🤖','👽','🦾','🦿','🫡','😤'] },
    { id: 'gold', name: 'Gold Premium', premium: true, stickers: ['🥇','🥈','🥉','🏅','🎖️','📯','🎺','🪙','💰','💸','💎','🔱','🏛️','🎫','🏆','🌟','✨','👑','🏵️','🧧'] }
  ],

  // ===== АНИМАЦИОННЫЕ СТИКЕРЫ (из папки animated-stickers) =====
  animatedStickers: [
    { file: 'heart.svg', name: 'Сердце', premium: false },
    { file: 'star.svg', name: 'Звезда', premium: false },
    { file: 'fire.svg', name: 'Огонь', premium: false },
    { file: 'thumbs.svg', name: 'Класс', premium: false },
    { file: 'rocket.svg', name: 'Ракета', premium: true },
    { file: 'party.svg', name: 'Праздник', premium: true },
    { file: 'smile.svg', name: 'Улыбка', premium: false },
    { file: 'ghost.svg', name: 'Привидение', premium: false }
  ],

  init() {
    this.loadUsers();
    this.bindEvents();
    if (localStorage.getItem('sk_user')) {
      this.login(localStorage.getItem('sk_user'));
    }
  },

  // ===== БАЗА ПОЛЬЗОВАТЕЛЕЙ =====
  loadUsers() {
    // Только реальные пользователи. Нереальных нет — они появятся при регистрации.
    const stored = JSON.parse(localStorage.getItem('sk_users') || '[]');
    const daniil = {
      id: 'u1',
      name: 'Даниил',
      email: 'durnevdaniil921@gmail.com',
      password: 'daniil921',
      premium: true,
      color: '#2ea6ff',
      userID: '5003-5003',
      phone: '+7 (900) 000-00-00'
    };
    this.allUsers = [daniil];
    stored.forEach(u => {
      if (!this.allUsers.find(x => x.email === u.email)) this.allUsers.push(u);
    });
    this.saveUsers();
  },

  saveUsers() {
    const registered = this.allUsers.filter(u => u.id !== 'u1');
    localStorage.setItem('sk_users', JSON.stringify(registered));
  },

  findUser(email) {
    return this.allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
  },

  findByIdOrPhone(q) {
    q = q.trim();
    // по ID вида 5003-5003
    const byId = this.allUsers.find(u => u.userID && u.userID.toLowerCase() === q.toLowerCase());
    if (byId) return byId;
    // по номеру телефона (оставляем только цифры)
    const digits = q.replace(/\D/g, '');
    if (digits.length >= 10) {
      return this.allUsers.find(u => u.phone && u.phone.replace(/\D/g, '').endsWith(digits.slice(-10)));
    }
    return null;
  },

  // ===== AUTH =====
  showAuthError(msg) {
    const el = document.getElementById('authError');
    el.textContent = msg;
    el.hidden = false;
    setTimeout(() => el.hidden = true, 5000);
  },

  login(email) {
    const user = this.findUser(email);
    if (!user) { this.showAuthError('Пользователь не найден. Зарегистрируйтесь.'); return; }
    this.user = user;
    this.premium = user.premium;
    this.contacts = JSON.parse(localStorage.getItem('sk_contacts_' + user.id) || '[]');
    this.messages = JSON.parse(localStorage.getItem('sk_messages_' + user.id) || '{}');

    localStorage.setItem('sk_user', user.email);
    document.getElementById('authScreen').hidden = true;
    document.getElementById('app').hidden = false;

    this.renderSidebar();
    this.renderChats();
    this.bindAppEvents();
  },

  register(name, email, password, userID, phone, social) {
    if (this.findUser(email)) { this.showAuthError('Пользователь с такой почтой уже существует. Войдите.'); return; }
    if (userID && this.allUsers.some(u => u.userID === userID)) { this.showAuthError('Такой ID уже занят. Придумайте другой.'); return; }
    if (phone) {
      const digits = phone.replace(/\D/g, '');
      if (this.allUsers.some(u => u.phone && u.phone.replace(/\D/g, '') === digits)) { this.showAuthError('Такой номер уже зарегистрирован.'); return; }
    }

    const colors = ['#e17076','#7bc862','#e5c562','#65aadd','#e86e6e','#a695e7','#86c96c','#dba868'];
    const user = {
      id: 'u' + Date.now(),
      name: name || (email.split('@')[0]),
      email,
      password: password || 'social',
      premium: false,
      color: colors[Math.floor(Math.random() * colors.length)],
      userID: userID || null,
      phone: phone || null,
      social: social || null
    };
    this.allUsers.push(user);
    this.saveUsers();
    this.login(email);
  },

  logout() {
    localStorage.removeItem('sk_user');
    this.user = null;
    this.contacts = [];
    this.messages = {};
    document.getElementById('app').hidden = true;
    document.getElementById('authScreen').hidden = false;
  },

  // ===== SIDEBAR / CHATS =====
  renderSidebar() {
    document.getElementById('myName').textContent = this.user.name;
    document.getElementById('myAvatar').textContent = this.user.name[0];
    document.getElementById('myAvatar').style.background = this.user.premium ? 'var(--gold-grad)' : this.user.color;
    document.getElementById('myStatus').textContent = this.user.premium ? '⭐ Premium' : 'Онлайн';
    document.getElementById('btnPremium').style.color = this.user.premium ? 'var(--gold)' : '';
  },

  renderChats() {
    const list = document.getElementById('chatsList');
    list.innerHTML = '';
    if (!this.contacts.length) {
      list.innerHTML = '<div class="no-contacts">Контактов пока нет.<br>Добавьте по ID или номеру 👇</div>';
      return;
    }
    this.contacts.forEach(c => {
      const msgs = this.messages[c.id] || [];
      const last = msgs[msgs.length - 1];
      const div = document.createElement('div');
      div.className = 'chat-item' + (this.currentChat === c.id ? ' active' : '');
      div.dataset.id = c.id;
      div.innerHTML = `
        <div class="avatar${c.premium ? ' premium-avatar' : ''}" style="background:${c.color}">${c.name[0]}</div>
        <div class="ci-info">
          <div class="ci-top">
            <span class="ci-name">${c.name}${c.premium ? '<span class="premium-tag">Premium</span>' : ''}</span>
            <span class="ci-time">${last ? this.fmtTime(last.date) : ''}</span>
          </div>
          <div class="ci-bottom">
            <span class="ci-preview">${last ? (last.sticker ? '🎨 Стикер' : last.text) : 'Нет сообщений'}</span>
          </div>
        </div>
      `;
      div.addEventListener('click', () => this.openChat(c.id));
      list.appendChild(div);
    });
  },

  fmtTime(d) {
    if (!d) return '';
    const now = new Date();
    const date = new Date(d);
    if (date.toDateString() === now.toDateString()) {
      return String(date.getHours()).padStart(2,'0') + ':' + String(date.getMinutes()).padStart(2,'0');
    }
    return String(date.getDate()).padStart(2,'0') + '.' + String(date.getMonth()+1).padStart(2,'0');
  },

  openChat(id) {
    this.currentChat = id;
    document.getElementById('emptyState').hidden = true;
    document.getElementById('chat').hidden = false;
    document.getElementById('main').classList.add('open');

    const c = this.contacts.find(x => x.id === id);
    document.getElementById('chatAvatar').textContent = c.name[0];
    document.getElementById('chatAvatar').style.background = c.color;
    document.getElementById('chatAvatar').classList.toggle('premium-avatar', !!c.premium);
    document.getElementById('chatName').textContent = c.name;
    document.getElementById('chatStatus').textContent = c.userID ? ('ID: ' + c.userID + ' • онлайн') : 'онлайн';

    const chatEl = document.getElementById('chat');
    chatEl.classList.toggle('rainbow', c.premium && this.premium);
    chatEl.classList.toggle('has-wallpaper', c.premium && this.premium);

    this.renderMessages(id);
    this.renderChats();
  },

  renderMessages(chatId) {
    const container = document.getElementById('messages');
    container.innerHTML = '';
    const msgs = this.messages[chatId] || [];
    const contact = this.contacts.find(c => c.id === chatId);

    if (!msgs.length) {
      const empty = document.createElement('div');
      empty.className = 'msg system';
      empty.textContent = 'Нет сообщений. Напишите первым!';
      container.appendChild(empty);
    }

    msgs.forEach(m => {
      const div = document.createElement('div');
      const isOut = m.from === 'me';
      div.className = `msg ${isOut ? 'out' : 'in'}`;
      if (isOut && this.premium) div.classList.add('premium-glow');

      let body = '';
      if (m.sticker) {
        const sp = this.stickerPacks.find(p => p.stickers.includes(m.sticker));
        const isPremiumSticker = sp && sp.premium;
        body = `<div class="msg-sticker${isPremiumSticker ? ' premium' : ''}">${m.sticker}</div>`;
      } else if (m.animSticker) {
        body = `<img class="msg-anim-sticker" src="animated-stickers/${m.animSticker}" alt="стикер">`;
      } else {
        body = `<div class="msg-content">${m.text}</div>`;
      }

      div.innerHTML = `
        ${!isOut && contact && contact.premium ? '<div class="premium-msg-badge">⭐ Premium</div>' : ''}
        ${!isOut && contact ? `<div class="msg-author">${contact.name}</div>` : ''}
        ${body}
        <div class="msg-meta">
          ${isOut ? '<span class="msg-ticks">✓✓</span>' : ''}
          ${this.fmtTime(m.date)}
        </div>
      `;
      container.appendChild(div);
    });

    requestAnimationFrame(() => container.scrollTop = container.scrollHeight);
  },

  sendMessage(text, sticker, animSticker) {
    const input = document.getElementById('msgInput');
    if (!text && !sticker && !animSticker) return;
    input.innerHTML = '';

    const contact = this.contacts.find(c => c.id === this.currentChat);
    if (!contact) return;

    if (!this.messages[this.currentChat]) this.messages[this.currentChat] = [];
    const msgs = this.messages[this.currentChat];
    msgs.push({
      id: Date.now(),
      from: 'me',
      text: text || '',
      sticker: sticker || null,
      animSticker: animSticker || null,
      date: new Date().toISOString()
    });
    this.saveState();
    this.renderMessages(this.currentChat);
    this.renderChats();

    setTimeout(() => {
      const replies = ['Понял!', 'Окей)', 'Хорошо', 'Договорились 🤝', '👍', '🔥', '❤️', 'Класс!'];
      const r = replies[Math.floor(Math.random() * replies.length)];
      msgs.push({ id: Date.now(), from: contact.id, text: r, sticker: null, animSticker: null, date: new Date().toISOString() });
      this.saveState();
      this.renderMessages(this.currentChat);
      this.renderChats();
    }, 900 + Math.random() * 1200);
  },

  saveState() {
    if (!this.user) return;
    localStorage.setItem('sk_contacts_' + this.user.id, JSON.stringify(this.contacts));
    localStorage.setItem('sk_messages_' + this.user.id, JSON.stringify(this.messages));
  },

  // ===== CONTACTS (по ID / номеру / сети) =====
  renderNetwork() {
    const list = document.getElementById('networkList');
    list.innerHTML = '';
    const others = this.allUsers.filter(u => u.id !== this.user.id);
    if (!others.length) {
      list.innerHTML = '<div class="msg system">Сеть пуста. Никто ещё не зарегистрировался.</div>';
      return;
    }
    others.forEach(u => {
      const added = this.contacts.some(c => c.id === u.id);
      const div = document.createElement('div');
      div.className = 'network-user';
      div.innerHTML = `
        <div class="avatar${u.premium ? ' premium-avatar' : ''}" style="background:${u.color}">${u.name[0]}</div>
        <div class="nu-info">
          <div class="nu-name">${u.name}${u.premium ? '<span class="premium-tag">Premium</span>' : ''}</div>
          <div class="nu-mail">${u.userID || u.phone || u.email}</div>
        </div>
        <button class="add-btn${added ? ' added' : ''}" ${added ? 'disabled' : ''}>${added ? '✓ Добавлен' : 'Добавить'}</button>
      `;
      if (!added) {
        div.querySelector('.add-btn').addEventListener('click', () => this.addContact(u.id));
      }
      list.appendChild(div);
    });
  },

  addContact(userId) {
    const u = this.allUsers.find(x => x.id === userId);
    if (!u || this.contacts.some(c => c.id === u.id)) return;
    const contact = { id: u.id, name: u.name, email: u.email, color: u.color, premium: u.premium, userID: u.userID, phone: u.phone };
    this.contacts.push(contact);
    this.saveState();
    this.renderNetwork();
    this.renderChats();
    this.showToast('Контакт «' + u.name + '» добавлен!');
  },

  findAndAddContact(query) {
    const u = this.findByIdOrPhone(query);
    const result = document.getElementById('findResult');
    if (!u) {
      result.innerHTML = '<div class="find-error">Пользователь не найден. Проверьте ID (например 5003-5003) или номер (+7...).</div>';
      return;
    }
    if (u.id === this.user.id) {
      result.innerHTML = '<div class="find-error">Это ваш собственный ID.</div>';
      return;
    }
    if (this.contacts.some(c => c.id === u.id)) {
      result.innerHTML = '<div class="find-error">Этот пользователь уже у вас в контактах.</div>';
      return;
    }
    result.innerHTML = `
      <div class="network-user">
        <div class="avatar${u.premium ? ' premium-avatar' : ''}" style="background:${u.color}">${u.name[0]}</div>
        <div class="nu-info">
          <div class="nu-name">${u.name}${u.premium ? '<span class="premium-tag">Premium</span>' : ''}</div>
          <div class="nu-mail">${u.userID || u.phone || u.email}</div>
        </div>
        <button class="add-btn" id="btnAddFound">Добавить</button>
      </div>
    `;
    document.getElementById('btnAddFound').addEventListener('click', () => {
      this.addContact(u.id);
      result.innerHTML = '<div class="find-ok">✓ Контакт добавлен!</div>';
    });
  },

  showToast(text, cls = '') {
    const t = document.createElement('div');
    t.className = 'toast' + (cls ? ' ' + cls : '');
    t.textContent = text;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3000);
  },

  // ===== STICKERS =====
  openStickers() {
    document.getElementById('stickerPanel').hidden = false;
    this.renderStickerPacks();
  },

  renderStickerPacks() {
    const wrap = document.getElementById('stickerPacks');
    wrap.innerHTML = '';

    // Пак анимационных стикеров
    const animPack = document.createElement('div');
    animPack.className = 'sticker-pack' + ' active';
    animPack.innerHTML = `
      <div class="sticker-item" style="width:56px;height:56px;font-size:28px;cursor:default">🎬</div>
      <div class="sticker-pack-name">Анимация</div>
    `;
    animPack.addEventListener('click', () => {
      wrap.querySelectorAll('.sticker-pack').forEach(x => x.classList.remove('active'));
      animPack.classList.add('active');
      this.renderAnimatedGrid();
    });
    wrap.appendChild(animPack);

    // Статические паки
    this.stickerPacks.forEach((p, i) => {
      const pack = document.createElement('div');
      pack.className = 'sticker-pack';
      pack.innerHTML = `
        <div class="sticker-item" style="width:56px;height:56px;font-size:28px;cursor:default">${p.stickers[0]}</div>
        <div class="sticker-pack-name">${p.name}${p.premium && !this.premium ? ' 🔒' : ''}</div>
      `;
      pack.addEventListener('click', () => {
        if (p.premium && !this.premium) {
          this.showToast('Premium-пак стикеров. Активируйте Premium!', 'gold');
          this.openPremium();
          return;
        }
        wrap.querySelectorAll('.sticker-pack').forEach(x => x.classList.remove('active'));
        pack.classList.add('active');
        this.renderStickerGrid(p);
      });
      wrap.appendChild(pack);
    });

    this.renderAnimatedGrid();
  },

  renderAnimatedGrid() {
    const existing = document.querySelector('.sticker-grid');
    if (existing) existing.remove();

    const grid = document.createElement('div');
    grid.className = 'sticker-grid';
    this.animatedStickers.forEach(s => {
      const item = document.createElement('div');
      item.className = 'sticker-item anim';
      item.innerHTML = `<img src="animated-stickers/${s.file}" alt="${s.name}" title="${s.name}">`;
      if (s.premium && !this.premium) {
        item.classList.add('premium-lock');
        item.addEventListener('click', () => {
          this.showToast('Анимационный стикер Premium. Активируйте Premium!', 'gold');
          this.openPremium();
        });
      } else {
        item.addEventListener('click', () => {
          this.sendMessage(null, null, s.file);
          document.getElementById('stickerPanel').hidden = true;
        });
      }
      grid.appendChild(item);
    });
    document.querySelector('.sticker-sheet').appendChild(grid);
  },

  renderStickerGrid(pack) {
    const existing = document.querySelector('.sticker-grid');
    if (existing) existing.remove();

    if (pack.premium && !this.premium) return;

    const grid = document.createElement('div');
    grid.className = 'sticker-grid';
    pack.stickers.forEach(s => {
      const item = document.createElement('div');
      item.className = 'sticker-item';
      item.textContent = s;
      item.addEventListener('click', () => {
        this.sendMessage(null, s, null);
        document.getElementById('stickerPanel').hidden = true;
      });
      grid.appendChild(item);
    });
    document.querySelector('.sticker-sheet').appendChild(grid);
  },

  // ===== PREMIUM =====
  openPremium() {
    document.getElementById('premiumModal').hidden = false;
  },

  activatePremium() {
    this.premium = true;
    if (this.user) {
      this.user.premium = true;
      const idx = this.allUsers.findIndex(u => u.id === this.user.id);
      if (idx >= 0) this.allUsers[idx].premium = true;
      this.saveUsers();
      this.saveState();
    }
    this.renderSidebar();
    this.renderChats();
    if (this.currentChat !== null) {
      const c = this.contacts.find(x => x.id === this.currentChat);
      const chatEl = document.getElementById('chat');
      chatEl.classList.toggle('rainbow', c && c.premium && this.premium);
      chatEl.classList.toggle('has-wallpaper', c && c.premium && this.premium);
      this.renderMessages(this.currentChat);
    }
    document.getElementById('premiumModal').hidden = true;
    this.showToast('СК Контакт Premium активирован! ⭐', 'gold');
  },

  // ===== EVENTS =====
  bindEvents() {
    document.getElementById('tabLogin').addEventListener('click', () => this.switchTab('login'));
    document.getElementById('tabRegister').addEventListener('click', () => this.switchTab('register'));

    // Логин
    document.getElementById('loginForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value.trim();
      const pass = document.getElementById('loginPassword').value.trim();
      const user = this.findUser(email);
      if (!user) { this.showAuthError('Пользователь не найден. Зарегистрируйтесь.'); return; }
      if (user.password !== pass) {
        this.showAuthError('Неверный пароль. Для Даниила: daniil921');
        return;
      }
      this.login(email);
    });

    // Регистрация: шаг 1 → шаг 2
    document.getElementById('btnRegNext1').addEventListener('click', () => {
      const name = document.getElementById('regName').value.trim();
      const email = document.getElementById('regEmail').value.trim();
      const pass = document.getElementById('regPassword').value.trim();
      if (!name || !email || !pass) { this.showAuthError('Заполните имя, почту и пароль'); return; }
      if (!email.includes('@')) { this.showAuthError('Некорректная почта'); return; }
      if (pass.length < 4) { this.showAuthError('Пароль минимум 4 символа'); return; }
      document.getElementById('regStep1').hidden = true;
      document.getElementById('regStep2').hidden = false;
    });

    document.getElementById('btnRegBack1').addEventListener('click', () => {
      document.getElementById('regStep1').hidden = false;
      document.getElementById('regStep2').hidden = true;
    });

    // Финальный шаг регистрации: ID или телефон
    document.getElementById('registerForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('regName').value.trim();
      const email = document.getElementById('regEmail').value.trim();
      const pass = document.getElementById('regPassword').value.trim();
      const userID = document.getElementById('regId').value.trim();
      const phone = document.getElementById('regPhone').value.trim();

      // Проверка ID: формат 4 цифры - 4 цифры
      const idOk = /^\d{4}-\d{4}$/.test(userID);
      // Проверка телефона: начинается с 7 или 8, минимум 10 цифр
      const phoneDigits = phone.replace(/\D/g, '');
      const phoneOk = phoneDigits.length >= 10 && (phoneDigits[0] === '7' || phoneDigits[0] === '8');

      if (!idOk && !phoneOk) {
        this.showAuthError('Введите ID в формате 5003-5003 (4 цифры - 4 цифры) или номер телефона +7...');
        return;
      }

      let finalID = userID;
      let finalPhone = phone;
      if (!idOk) {
        // ID не подошёл — пробуем телефон
        finalID = null;
        if (!phoneOk) { this.showAuthError('Введите корректный номер: +7 (900) 000-00-00'); return; }
        // ID сгенерируем от номера
        finalID = phoneDigits.slice(0,4) + '-' + phoneDigits.slice(4,8);
      } else {
        finalPhone = null;
      }

      this.register(name, email, pass, finalID, finalPhone, null);
    });

    // Соцсети
    document.querySelectorAll('.social-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const social = btn.dataset.social;
        const email = prompt('Введите почту для входа через ' + social + ':');
        if (!email) return;
        const user = this.findUser(email);
        if (user) {
          this.login(email);
        } else {
          // Соцсеть создаёт аккаунт автоматически: имя из почты, ID рандомный
          const autoID = String(Math.floor(1000 + Math.random()*9000)) + '-' + String(Math.floor(1000 + Math.random()*9000));
          this.register(null, email, 'social', autoID, null, social);
        }
      });
    });
  },

  switchTab(which) {
    document.getElementById('tabLogin').classList.toggle('active', which === 'login');
    document.getElementById('tabRegister').classList.toggle('active', which === 'register');
    document.getElementById('loginForm').hidden = which !== 'login';
    document.getElementById('registerForm').hidden = which !== 'register';
    document.getElementById('authError').hidden = true;
  },

  bindAppEvents() {
    document.getElementById('btnLogout').addEventListener('click', () => this.logout());

    document.getElementById('btnSend').addEventListener('click', () => {
      this.sendMessage(document.getElementById('msgInput').innerText.trim());
    });
    document.getElementById('msgInput').addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage(document.getElementById('msgInput').innerText.trim());
      }
    });

    document.getElementById('btnBack').addEventListener('click', () => {
      document.getElementById('main').classList.remove('open');
      document.getElementById('chat').hidden = true;
      document.getElementById('emptyState').hidden = false;
      this.currentChat = null;
    });

    // Добавление контакта
    document.getElementById('btnAddContact').addEventListener('click', () => {
      document.getElementById('findResult').innerHTML = '';
      document.getElementById('contactSearchInput').value = '';
      this.renderNetwork();
      document.getElementById('addContactModal').hidden = false;
    });
    document.getElementById('btnCloseAddContact').addEventListener('click', () => document.getElementById('addContactModal').hidden = true);
    document.getElementById('addContactBackdrop').addEventListener('click', () => document.getElementById('addContactModal').hidden = true);

    // Вкладки «По ID» / «По сети»
    document.getElementById('tabById').addEventListener('click', () => {
      document.getElementById('tabById').classList.add('active');
      document.getElementById('tabByNetwork').classList.remove('active');
      document.getElementById('byIdWrap').hidden = false;
      document.getElementById('networkList').hidden = true;
    });
    document.getElementById('tabByNetwork').addEventListener('click', () => {
      document.getElementById('tabByNetwork').classList.add('active');
      document.getElementById('tabById').classList.remove('active');
      document.getElementById('byIdWrap').hidden = true;
      document.getElementById('networkList').hidden = false;
      this.renderNetwork();
    });

    document.getElementById('btnFindUser').addEventListener('click', () => {
      this.findAndAddContact(document.getElementById('contactSearchInput').value);
    });
    document.getElementById('contactSearchInput').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.findAndAddContact(document.getElementById('contactSearchInput').value);
    });

    // Стикеры
    document.getElementById('btnStickers').addEventListener('click', () => this.openStickers());
    document.getElementById('btnCloseStickers').addEventListener('click', () => document.getElementById('stickerPanel').hidden = true);
    document.getElementById('stickerBackdrop').addEventListener('click', () => document.getElementById('stickerPanel').hidden = true);

    // Premium
    document.getElementById('btnPremium').addEventListener('click', () => this.openPremium());
    document.getElementById('btnBuyPremium').addEventListener('click', () => this.activatePremium());
    document.getElementById('btnClosePremium').addEventListener('click', () => document.getElementById('premiumModal').hidden = true);
    document.getElementById('premiumBackdrop').addEventListener('click', () => document.getElementById('premiumModal').hidden = true);

    // Поиск по чатам
    document.getElementById('searchInput').addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase();
      document.querySelectorAll('.chat-item').forEach(el => {
        const name = el.querySelector('.ci-name').textContent.toLowerCase();
        el.style.display = name.includes(q) ? '' : 'none';
      });
    });

    document.getElementById('btnTheme').addEventListener('click', () => this.showToast('Кастомные темы — в Premium', 'gold'));
    document.getElementById('btnAttach').addEventListener('click', () => this.showToast('Облако — в Premium', 'gold'));
    document.getElementById('btnSearchMsg').addEventListener('click', () => this.showToast('Поиск по сообщениям'));
    document.getElementById('btnChatMenu').addEventListener('click', () => this.showToast('Настройки чата'));
  }
};

document.addEventListener('DOMContentLoaded', () => app.init());