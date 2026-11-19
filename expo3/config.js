window.LIKEVR_PROPOSAL = {
  base: [
    { label: 'Программная часть', price: 380000, description: 'Распознавание речи, поиск по базе знаний, формирование и озвучка ответов.' },
    { label: 'Три киоска', price: 200000, description: 'Киоски с доставкой, монтажом, демонтажом и вывозом.' },
    { label: 'Запуск и ведение проекта', price: 50000, description: 'Настройка, проверка сценариев и координация запуска.' },
  ],
  computerPrice: 40000,
  characters: {
    likevr: { label: 'Адаптация персонажа LikeVR', price: 50000, computers: 3 },
    webgpu: { label: 'WebGPU-персонаж', price: 80000, computers: 1 },
    external: { label: 'Подбор персонажа под ваш бренд', price: 250000, computers: 3 },
  },
  costume: 40000,
  support: {
    none: { label: 'Без сопровождения', price: 0, description: 'После запуска с киосками работает ваша команда.' },
    remote: { label: 'Удалённое сопровождение', price: 24000, description: 'На связи три дня. Помогаем вашей команде разобраться со сбоями и настройками удалённо.' },
    onsite: { label: 'Специалист на площадке', price: 75000, description: 'Специалист работает на площадке три дня, проверяет работу киосков и помогает на месте при сбоях.' },
  },
  usage: { includedDialogues: [1000, 2000, 3000], apiPerDialogue: 14, server: 2500 },
  contacts: {
    telegram: 'https://t.me/ART_TEAM573',
    email: 's.artem@likevr.ru',
    phone: '+74950667169',
    phoneLabel: '+7 (495) 066-71-69',
  },
};
