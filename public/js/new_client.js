Addon.initialize({
    'card_buttons': async (cardButtonsContext) => {
        const buttons = [{
            text: 'Card_Title',
            callback: async (ctx) => {
                console.log('Кнопка нажата (v3_20/03/2026 - с поддержкой трех меток)');
                
                try {
                    // Параллельно получаем все необходимые данные + данные самой карточки
                    const [tags, customProps, cardType, card] = await Promise.all([
                        ctx.getCardProperties('tags'),
                        ctx.getCardProperties('customProperties'),
                        ctx.getCardProperties('type'),
                        ctx.getCard() // <-- Добавлено для получения cardId
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

                    // ================= НОВЫЙ ЭКСПЕРИМЕНТАЛЬНЫЙ БЛОК =================
                    
                    // 1. Получаем API клиент
                    const api = window.Addon.iframe().getApiClient();
                    
                    // 2. Получаем ID карточки
                    const cardId = card?.id;
                    if (!cardId) {
                        console.error('Не удалось получить ID карточки');
                        return;
                    }

                    // 3. Запрашиваем авторизацию (получаем access token)
                    try {
                        const { access_token, expires_at } = await api.authorize();
                        console.log('Authorized, expires at:', expires_at);
                    } catch (authError) {
                        console.error('Ошибка авторизации:', authError);
                        alert('Не удалось получить доступ к API. Пожалуйста, разрешите доступ.');
                        return; // Прерываем выполнение, если токен не получен
                    }

                    // 4. Обновляем название карточки через API
                    const updated = await api.patch(
                        `/api/v1/cards/${cardId}`,
                        { title: cardTitle } // <-- Передаем именно переменную cardTitle
                    );
                    
                    console.log('Карточка успешно обновлена:', updated);

                    // ================= КОНЕЦ НОВОГО БЛОКА =================
                    
                } catch (err) { // <-- ОБЯЗАТЕЛЬНО закрываем try блоком catch
                    console.error('Глобальная ошибка выполнения:', err);
                }
            } // <-- Закрытие callback
        }];
        
        return buttons;
    }
});
