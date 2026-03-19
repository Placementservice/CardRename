Addon.initialize({
  'card_buttons': async (cardButtonsContext) => {
    const buttons = = await Promise.all([
            callbackContext.getCardProperties('tags'),
            callbackContext.getCardProperties('customProperties'),
            callbackContext.getCardProperties('type')
          ]);

          // 2. Лаконичная проверка тега
          const hasCorrectionTag = Array.isArray(tags) && tags.some(t => t.name === 'Корректировка ТУ');

          // 3. Универсальная функция извлечения значений
          const getVal = (name) => {
            const field = Array.isArray(customProps) && customProps.find(p => p.property?.name === name);
            if (!field || field.value == null) return 'XXXX';
            if (typeof field.value === 'object') return field.value.name || field.value.value || 'XXXX';
            return String(field.value).trim() || 'XXXX';
          };

          // 4. Сокращения для типов работ через объект-маппинг (быстрее switch)
          const workTypeMap = { 'Модернизация': 'Мод', 'ВОЛС': 'ВОЛС', 'Новая стройка': 'НС' };
          const workType = getVal('Тип работ');
          const workTypeAbbr = workTypeMap[workType] || workType;

          // 5. Извлечение типа карточки
          const typeName = (cardType?.name || (typeof cardType === 'string' ? cardType : 'XXXX'));

          // 6. Формирование финальной строки (Template literals)
          const cardTitle = [
            getVal('Номер БС'),
            getVal('Субарендатор (Оператор)'),
            getVal('Объект'),
            typeName,
            workTypeAbbr
          ].join('_') + (hasCorrectionTag ? '_корр' : '');

          // 7. Оптимизированное копирование
          await copyToClipboard(cardTitle);
          alert(`Название скопировано!\n${cardTitle}`);

        } catch (err) {
          console.error('Ошибка:', err);
          alert('Произошла ошибка: ' + err.message);
        }
      }
    }];
    return buttons;
  }
});

// Вынесенная функция для чистоты кода
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch (e) {
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  }
}
