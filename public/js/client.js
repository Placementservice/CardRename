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

                    // Функция копирования в буфер обмена с запасными вариантами
                    const copyToClipboard = async (text) => {
                        // 1. Пробуем современный Clipboard API
                        try {
                            await navigator.clipboard.writeText(text);
                            return { success: true, method: 'api' };
                        } catch (apiError) {
                            console.warn('Clipboard API не сработал:', apiError);
                            
                            // 2. Пробуем запасной вариант с execCommand
                            try {
                                const textarea = document.createElement('textarea');
                                textarea.value = text;
                                textarea.style.cssText = 'position:fixed;opacity:0;';
                                document.body.appendChild(textarea);
                                textarea.select();
                                
                                const success = document.execCommand('copy');
                                document.body.removeChild(textarea);
                                
                                if (success) {
                                    return { success: true, method: 'execCommand' };
                                }
                                throw new Error('execCommand вернул false');
                            } catch (execError) {
                                console.warn('execCommand не сработал:', execError);
                                
                                // 3. Возвращаем неудачу для активации prompt
                                return { success: false };
                            }
                        }
                    };

                    // Копируем и показываем результат
                    const copyResult = await copyToClipboard(cardTitle);
                    
                    if (!copyResult.success) {
                        // Если автоматическое копирование не сработало, показываем prompt
                        console.log('Текст для ручного копирования:', cardTitle);
                        prompt('Скопируйте название карточки вручную (Ctrl+C):', cardTitle);
                    } else {
                        console.log('Название скопировано:', cardTitle);
                        // Опционально: показать уведомление об успешном копировании
                        // ctx.showNotification({ text: 'Название скопировано!', type: 'success' });
                    }

                } catch (err) {
                    console.error('Ошибка:', err);
                }
            }
        }];
        
        return buttons;
    }
});
