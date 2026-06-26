// ===== Защита от повторной инициализации =====
if (window.__kaitenAddonInitialized) {
  console.log('Аддон уже инициализирован, пропускаем повторную инициализацию');
} else {
  window.__kaitenAddonInitialized = true;

  // ===== Получаем API-клиент ОДИН РАЗ =====
  if (!window.__kaitenApiClient) {
    window.__kaitenApiClient = window.Addon.iframe().getApiClient();
  }
  const apiClient = window.__kaitenApiClient;

  Addon.initialize({
    'card_buttons': async (cardButtonsContext) => {
      const buttons = [{
        text: 'Card_Title',
        callback: async (ctx) => {
          console.log('Кнопка нажата (v6_26/06/2026 - защита от повторной инициализации)');
          try {
            // Параллельно получаем все необходимые данные
            const [tags, customProps, cardType, card] = await Promise.all([
              ctx.getCardProperties('tags'),
              ctx.getCardProperties('customProperties'),
              ctx.getCardProperties('type'),
              ctx.getCard()
            ]);

            // Массив меток, при наличии которых добавляется суффикс "_корр"
            const correctionTags = [
              'Корректировка ТУ',
              'Пересогласование ТР',
              'Повторный допуск'
            ];

            // Проверяем наличие хотя бы одной из меток
            const hasCorrectionTag = tags?.some?.(tag =>
              correctionTags.includes(tag.name)
            ) ?? false;

            if (hasCorrectionTag) {
              const foundTags = tags?.filter(tag => correctionTags.includes(tag.name)) || [];
              console.log('Найдены метки для суффикса _корр:', foundTags.map(t => t.name).join(', '));
            }

            // Функция для быстрого поиска значения в customProps
            const findFieldValue = (fieldName) => {
              const field = customProps?.find(item => item.property?.name === fieldName);
              if (!field?.value) return 'XXXX';
              const val = field.value;
              return typeof val === 'object'
                ? val.name || val.value || 'XXXX'
                : String(val).trim() || 'XXXX';
            };

            // Получаем значения полей
            const [bsNumber, sublessor, object, workType] = [
              'Номер БС',
              'Субарендатор (Оператор)',
              'Объект',
              'Тип работ'
            ].map(findFieldValue);

            // Получаем тип карточки
            const typeName = cardType?.name || cardType || 'XXXX';

            // Сокращение для типа работ
            const workTypeMap = {
              'Модернизация': 'Мод',
              'ВОЛС': 'ВОЛС',
              'Новая стройка': 'НС'
            };
            const workTypeAbbr = workTypeMap[workType] || workType;

            // Формируем массив частей названия
            const titleParts = [
              bsNumber,
              sublessor,
              object,
              typeName,
              workTypeAbbr
            ];

            if (hasCorrectionTag) {
              titleParts.push('корр');
            }

            // Собираем название карточки
            const cardTitle = titleParts.join('_');

            // ========== БЛОК: Переименование карточки через API ==========
            try {
              // Проверяем авторизацию
              try {
                await apiClient.getAccessToken();
              } catch {
                console.log('Запускаем авторизацию аддона...');
                await apiClient.authorize();
              }

              const cardId = card.id;

              // PATCH-запрос для обновления названия
              const response = await apiClient.patch(`/api/v1/cards/${cardId}`, {
                title: cardTitle
              });

              if (response.ok) {
                console.log('Название карточки успешно изменено на:', cardTitle);
              } else {
                console.warn('Не удалось изменить название карточки. Статус:', response.status, response);
              }
            } catch (apiError) {
              console.error('Ошибка при переименовании карточки через API:', apiError);
            }
            // ========== КОНЕЦ БЛОКА ==========

          } catch (err) {
            console.error('Ошибка:', err);
          }
        }
      }];
      return buttons;
    }
  });
}
