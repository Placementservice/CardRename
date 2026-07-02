Addon.initialize({
    'card_buttons': async (cardButtonsContext) => {
        const buttons = [{
            text: 'Card_Title',
            callback: async (ctx) => {
                console.log('Кнопка нажата (v3_20/03/2026 - с поддержкой трех меток)');
                
                try {
                    // Параллельно получаем все необходимые данные
                    const [tags, customProps, cardType] = await Promise.all([
                        ctx.getCardProperties('tags'),
                        ctx.getCardProperties('customProperties'),
                        ctx.getCardProperties('type')
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

                    // Новый эксперементальный блок вручную НАЧАЛО
                    
                    // Inside an addon iframe
                    const api = window.Addon.iframe().getApiClient();
                    
                    const button = {
                      text: 'Connect to platform API',
                      callback: async () => {
                        // Resolves with { access_token, expires_at } after the user grants consent.
                        const { access_token, expires_at } = await api.authorize();
                        console.log('Authorized, expires at:', expires_at);
                      },
                    };
                    
                    const updated = await api.patch(
                      `/api/v1/cards/${cardId}`,
                      { title: 'Вставить cardTitle' },
                    );

                    // Новый эксперементальный блок вручную КОНЕЦ
                    
            }
        }];
        
        return buttons;
    }
});
