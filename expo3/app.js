(() => {
  'use strict';

  const { base, computerPrice, characters, costume, support, usage, contacts } = window.LIKEVR_PROPOSAL;
  const number = new Intl.NumberFormat('ru-RU');
  const money = value => `${number.format(value)} ₽`;
  const commonPrice = base.reduce((total, item) => total + item.price, 0);
  const hardware = character => character.computers * computerPrice;
  const hardwareLabel = character => character.computers === 1 ? '1 компьютер' : '3 компьютера';
  const projectPrice = character => commonPrice + character.price + hardware(character);

  document.querySelectorAll('[data-contacts]').forEach(container => {
    container.innerHTML = `
      <a href="${contacts.telegram}" target="_blank" rel="noopener"><span>Telegram</span><strong>@ART_TEAM573</strong></a>
      <a href="mailto:${contacts.email}"><span>Почта</span><strong>${contacts.email}</strong></a>
      <a href="tel:${contacts.phone}"><span>Телефон</span><strong>${contacts.phoneLabel}</strong></a>`;
  });

  document.querySelectorAll('[data-character-price]').forEach(label => {
    label.textContent = money(characters[label.dataset.characterPrice].price);
  });

  const pricing = document.querySelector('[data-pricing]');
  const tierOrder = ['webgpu', 'likevr', 'external'];
  pricing.innerHTML = `
    <div class="price-options" aria-label="Стоимость проекта по комплектациям">
      ${tierOrder.map(key => {
        const character = characters[key];
        return `
        <article class="price-option${key === 'likevr' ? ' price-highlight' : ''}">
          <h3>${character.label}</h3>
          <strong>${money(projectPrice(character))}</strong>
          <dl class="price-lines">
            <div><dt>${hardwareLabel(character)}</dt><dd>${money(hardware(character))}</dd></div>
            <div><dt>Итого без персонажа</dt><dd>${money(commonPrice + hardware(character))}</dd></div>
            <div><dt>Персонаж</dt><dd>${money(character.price)}</dd></div>
          </dl>
        </article>`;
      }).join('')}
    </div>
    <table class="price-table" aria-label="Общая часть всех комплектаций">
      <thead><tr><th scope="col">Общая часть проекта</th><th scope="col">Стоимость</th></tr></thead>
      <tbody>${base.map(({ label, price, description }) => `<tr><th scope="row">${label}<small>${description}</small></th><td>${money(price)}</td></tr>`).join('')}</tbody>
      <tfoot><tr><th scope="row">Итого без компьютеров и персонажа</th><td>${money(commonPrice)}</td></tr></tfoot>
    </table>
    <p class="hardware-note"><strong>Как работают киоски.</strong> Для WebGPU один компьютер обслуживает три точки. В двух других комплектациях у каждого киоска свой компьютер для работы консультанта и показа персонажа.</p>`;

  const root = document.querySelector('[data-calculator]');
  const options = list => Object.entries(list).map(([key, { label, price }]) =>
    `<option value="${key}">${label}${price ? ` · ${money(price)}` : ''}</option>`
  ).join('');

  root.innerHTML = `
    <div class="calc-layout">
      <form class="calc-form">
        <label class="field">Персонаж
          <select name="character">${options(characters)}</select>
        </label>
        <p class="fine fixed-scope" data-hardware></p>
        <label class="checkbox" data-costume-row>
          <input type="checkbox" name="costume">
          <span>Изменение тела или костюма <strong>+${money(costume)}</strong></span>
        </label>
        <label class="field">Сопровождение на три дня
          <select name="support" aria-describedby="support-detail">${options(support)}</select>
        </label>
        <p class="fine" id="support-detail" data-support-detail></p>
        <label class="field">Диалоги в месяц на три киоска суммарно
          <select name="dialogues">${usage.includedDialogues.map(value => `<option value="${value}">${number.format(value)} диалогов</option>`).join('')}</select>
        </label>
      </form>
      <aside class="calc-summary" aria-label="Итоговый расчёт">
        <dl class="totals" aria-live="polite" aria-atomic="true">
          <div><dt>Стоимость проекта</dt><dd data-once></dd></div>
          <div><dt>Ежемесячная эксплуатация</dt><dd data-monthly></dd></div>
        </dl>
        <dl class="price-lines" data-calc-breakdown></dl>
        <p class="fine calc-usage">Типовой диалог длится около 3 минут и включает 8 ответов. Ориентир — ${money(usage.apiPerDialogue)} за диалог и ${money(usage.server)} в месяц за сервер.</p>
      </aside>
    </div>`;

  const form = root.querySelector('form');
  const fields = form.elements;
  const costumeRow = root.querySelector('[data-costume-row]');
  const query = new URLSearchParams(location.search);
  if (Object.hasOwn(characters, query.get('character'))) fields.character.value = query.get('character');
  if (Object.hasOwn(support, query.get('support'))) fields.support.value = query.get('support');
  if (usage.includedDialogues.includes(Number(query.get('dialogues')))) fields.dialogues.value = query.get('dialogues');
  fields.costume.checked = fields.character.value === 'likevr' && query.get('costume') === '1';

  function render() {
    const character = characters[fields.character.value];
    const help = support[fields.support.value];
    const hasCostume = fields.character.value === 'likevr';
    const costumeCost = hasCostume && fields.costume.checked ? costume : 0;
    const monthly = Number(fields.dialogues.value) * usage.apiPerDialogue + usage.server;

    costumeRow.hidden = !hasCostume;
    fields.costume.disabled = !hasCostume;
    root.querySelector('[data-hardware]').textContent = `Три киоска, ${hardwareLabel(character)} и общая база знаний.`;
    root.querySelector('[data-support-detail]').textContent = help.description;
    root.querySelector('[data-once]').textContent = money(projectPrice(character) + help.price + costumeCost);
    root.querySelector('[data-monthly]').textContent = money(monthly);
    const breakdown = [
      ['Программа, киоски и запуск', commonPrice],
      [hardwareLabel(character), hardware(character)],
      ['Персонаж', character.price],
      ['Изменение тела или костюма', costumeCost],
      ['Сопровождение', help.price],
    ];
    root.querySelector('[data-calc-breakdown]').innerHTML = breakdown.filter(([, amount]) => amount)
      .map(([label, amount]) => `<div><dt>${label}</dt><dd>${money(amount)}</dd></div>`).join('');
  }

  form.addEventListener('submit', event => event.preventDefault());
  form.addEventListener('change', render);
  render();
})();
