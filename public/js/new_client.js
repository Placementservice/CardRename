Addon.initialize({
  'card_buttons': async (cardButtonsContext) => {
    const buttons = [{
      text: 'Card_Title',
      callback: async (ctx) => {
        console.log('Кнопка нажата (v4_26/06/2026 - переименование карточки)');
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

          // Логируем результат проверки для отладки
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

          // Добавляем суффикс "_корр" при наличии соответствующей метки
          if (hasCorrectionTag) {
            titleParts.push('корр');
          }

          // Собираем название карточки
          const cardTitle = titleParts.join('_');

          // ========== БЛОК: Переименование карточки через API ==========
          try {
            const api = window.Addon.iframe().getApiClient();

            // Проверяем, авторизован ли пользователь (паттерн из документации Kaiten)
            // SDK автоматически обновит токен при HTTP-запросах, но нужно убедиться,
            // что пользователь дал согласие на использование аддона
            try {
              await api.getAccessToken();
            } catch {
              // Если токен отсутствует — запускаем процесс авторизации
              console.log('Пользователь ещё не авторизовал аддон, запускаем авторизацию...');
              await api.authorize();
            }

            const cardId = card.id;

            // Обновляем название карточки через PATCH запрос
            // SDK сам добавит Authorization: Bearer <token> и обновит токен при 401
            const response = await api.patch(`/api/v1/cards/${cardId}`, {
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
