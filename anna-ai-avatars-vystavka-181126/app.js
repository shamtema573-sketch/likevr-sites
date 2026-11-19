(() => {
  'use strict';

  const { base, characters, costume, support, usage, contacts } = window.LIKEVR_PROPOSAL;
  const number = new Intl.NumberFormat('ru-RU');
  const money = value => `${number.format(value)} ₽`;
  const basePrice = base.reduce((total, item) => total + item.price, 0);
  const subtotal = character => basePrice + characters[character].price;
  const query = new URLSearchParams(location.search);
  const layout = query.get('view') === 'a' ? 'a' : 'b';

  document.querySelectorAll('[data-contacts]').forEach(container => {
    container.innerHTML = `
      <a href="${contacts.telegram}" target="_blank" rel="noopener"><span>Telegram</span><strong>@ART_TEAM573 →</strong></a>
      <a href="mailto:${contacts.email}"><span>Почта</span><strong>${contacts.email}</strong></a>
      <a href="tel:${contacts.phone}"><span>Телефон</span><strong>${contacts.phoneLabel}</strong></a>`;
  });

  const pricing = document.querySelector('[data-pricing]');
  if (pricing) {
    pricing.innerHTML = `
      <div class="price-options" aria-label="Стоимость проекта по вариантам">
        ${Object.entries(characters).map(([key, character]) => `
          <article class="price-option${key === 'likevr' ? ' price-highlight' : ''}">
            <h3>${character.label}</h3>
            <strong>${character.estimate ? '≈ ' : ''}${money(subtotal(key))}</strong>
            <p>${character.description} · ${character.estimate ? '≈ ' : ''}${money(character.price)}</p>
          </article>`).join('')}
      </div>
      <table class="price-table" aria-label="Общая часть всех комплектаций">
        <thead><tr><th scope="col">Общая часть проекта</th><th scope="col">Стоимость</th></tr></thead>
        <tbody>${base.map(({ label, price }) => `<tr><th scope="row">${label}</th><td>${money(price)}</td></tr>`).join('')}</tbody>
        <tfoot><tr><th scope="row">Итого без персонажа</th><td>${money(basePrice)}</td></tr></tfoot>
      </table>`;
  }

  const root = document.querySelector('[data-calculator]');
  if (!root) return;

  function optionMarkup(options) {
    return Object.entries(options).map(([value, { label, price, estimate }]) => {
      const amount = price ? ` · ${estimate ? '≈ ' : ''}${money(price)}` : '';
      return `<option value="${value}">${label}${amount}</option>`;
    }).join('');
  }

  root.innerHTML = `
    <div class="calc-layout">
      <form class="calc-form">
        <p class="fine fixed-scope">3 киоска, 3 компьютера, общая база знаний и один персонаж на три точки.</p>
        <label class="field">Персонаж
          <select name="character">${optionMarkup(characters)}</select>
        </label>
        <label class="checkbox" data-costume-row>
          <input type="checkbox" name="costume">
          <span>Изменение тела или костюма <strong>+${money(costume)}</strong></span>
        </label>
        <label class="field">Сопровождение на три дня
          <select name="support">${optionMarkup(support)}</select>
        </label>
        <p class="fine">Если у вас есть представитель на площадке, рекомендуем удалённое сопровождение.</p>
        <label class="field">Диалоги в месяц на три киоска суммарно
          <select name="dialogues">${usage.includedDialogues.map(value => `<option value="${value}">${number.format(value)} диалогов</option>`).join('')}</select>
        </label>
      </form>
      <aside class="calc-summary" aria-label="Итоговый расчёт">
        <dl class="totals" aria-live="polite" aria-atomic="true">
          <div><dt data-once-label>Разово</dt><dd data-once></dd></div>
          <div><dt>Ежемесячная эксплуатация</dt><dd data-monthly></dd></div>
        </dl>
        <p class="fine" data-once-note></p>
        <p class="fine">Типовой диалог длится около 3 минут и включает 8 ответов. API — ориентир ${money(usage.apiPerDialogue)} за диалог, сервер — ${money(usage.server)} в месяц.</p>
      </aside>
    </div>`;

  const form = root.querySelector('form');
  const fields = form.elements;
  const costumeRow = root.querySelector('[data-costume-row]');
  const separateLink = document.querySelector('[data-separate]');
  const returnLink = document.querySelector('[data-return]');

  if (Object.hasOwn(characters, query.get('character'))) fields.character.value = query.get('character');
  if (Object.hasOwn(support, query.get('support'))) fields.support.value = query.get('support');
  if (usage.includedDialogues.includes(Number(query.get('dialogues')))) fields.dialogues.value = query.get('dialogues');
  fields.costume.checked = fields.character.value === 'likevr' && query.get('costume') === '1';

  function render() {
    const character = characters[fields.character.value];
    const hasCostume = fields.character.value === 'likevr';
    const extras = support[fields.support.value].price + (hasCostume && fields.costume.checked ? costume : 0);
    const monthly = Number(fields.dialogues.value) * usage.apiPerDialogue + usage.server;

    costumeRow.hidden = !hasCostume;
    fields.costume.disabled = !hasCostume;
    root.querySelector('[data-once-label]').textContent = character.estimate ? 'Разово, ориентир' : 'Разово';
    root.querySelector('[data-once]').textContent = money(subtotal(fields.character.value) + extras);
    root.querySelector('[data-monthly]').textContent = money(monthly);
    root.querySelector('[data-once-note]').textContent = character.estimate
      ? 'Ориентир включает три компьютера и выбранные опции.'
      : 'Разовая сумма включает выбранные опции.';

    if (separateLink || returnLink) {
      const selection = new URLSearchParams({
        character: fields.character.value,
        support: fields.support.value,
        dialogues: fields.dialogues.value,
        costume: hasCostume && fields.costume.checked ? '1' : '0',
        view: layout,
      });
      if (separateLink) separateLink.href = `calculator.html?${selection}`;
      if (returnLink) returnLink.href = `index.html?${selection}#calculator`;
    }
  }

  form.addEventListener('submit', event => event.preventDefault());
  form.addEventListener('change', render);
  render();
})();
