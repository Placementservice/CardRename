Addon.initialize({
    'card_buttons': async (cardButtonsContext) => {
        const buttons = [];
        buttons.push({
            text: 'Тестовая кнопка (не нажимать)',
            callback: async (callbackContext, callbackOptions) => {
                console.log('Кнопка нажата (v2_18/03/2026 - 16:35)');
                try {
                    // Получаем список тегов карточки
                    const tags = await callbackContext.getCardProperties('tags');
                    
                    // Проверяем наличие метки "Корректировка ТУ" в массиве тегов
                    const hasCorrectionTag = Array.isArray(tags) && tags.some(tag => tag.name === 'Корректировка ТУ');
                    
                    // Присваиваем результат переменной
                    let correctionTagExists = hasCorrectionTag;

                    // Получаем пользовательские свойства (custom fields)
                    const customProps = await callbackContext.getCardProperties('customProperties');

                    // Функция для получения значения по имени поля
                    const getCustomFieldValue = (fieldName) => {
                        if (!Array.isArray(customProps)) return 'XXXX';
                        
                        const field = customProps.find(item => item.property?.name === fieldName);
                        
                        if (!field) return 'XXXX';
                        
                        // Обработка различных типов значений
                        if (field.value === null || field.value === undefined) return 'XXXX';
                        
                        if (typeof field.value === 'object' && field.value !== null) {
                            // Для объектов (например, catalog или select)
                            return field.value.name || field.value.value || 'XXXX';
                        } else if (typeof field.value === 'string') {
                            // Для строковых полей
                            return field.value.trim() || 'XXXX';
                        } else {
                            // Для других типов (числа, булевы и т.д.)
                            return String(field.value) || 'XXXX';
                        }
                    };

                    // Получаем значения из пользовательских свойств
                    const objectValue = getCustomFieldValue('Объект');
                    const sublessorValue = getCustomFieldValue('Субарендатор (Оператор)');
                    const workTypeValue = getCustomFieldValue('Тип работ');
                    const bsNumberValue = getCustomFieldValue('Номер БС');

                    // Присваиваем значения переменным
                    let objectField = objectValue;
                    let sublessorField = sublessorValue;
                    let workTypeField = workTypeValue;
                    let bsNumberField = bsNumberValue;

                    // Получаем значение name из типа карточки
                    const cardType = await callbackContext.getCardProperties('type');
                    
                    // Извлекаем name из типа карточки (если это объект с полем name)
                    let cardTypeName = 'XXXX';
                    if (cardType && typeof cardType === 'object' && cardType.name) {
                        cardTypeName = cardType.name;
                    } else if (typeof cardType === 'string') {
                        cardTypeName = cardType;
                    }

                    // Присваиваем переменной значение name
                    let typeNameField = cardTypeName;

                    // Функция для определения 5-й части названия на основе типа работ
                    const getWorkTypeAbbreviation = (workType) => {
                        switch(workType) {
                            case 'Модернизация':
                                return 'Мод';
                            case 'ВОЛС':
                                return 'ВОЛС';
                            case 'Новая стройка':
                                return 'НС';
                            default:
                                return workType;
                        }
                    };

                    // Получаем сокращение для типа работ
                    const workTypeAbbr = getWorkTypeAbbreviation(workTypeField);

                    // Формируем название карточки
                    let cardName = '';

                    // Часть 1: bsNumberField
                    cardName += bsNumberField;
                    
                    // Часть 2: sublessorField
                    cardName += '_' + sublessorField;
                    
                    // Часть 3: objectField
                    cardName += '_' + objectField;
                    
                    // Часть 4: typeNameField
                    cardName += '_' + typeNameField;
                    
                    // Часть 5: workTypeAbbr (сокращение типа работ)
                    cardName += '_' + workTypeAbbr;
                    
                    // Часть 6: если correctionTagExists = true, добавляем '_корр'
                    if (correctionTagExists) {
                        cardName += '_корр';
                    }

                    // Присваиваем переменной сформированное название карточки
                    let cardTitle = cardName;

                    // Функция для копирования в буфер обмена (с запасным методом)
                    const copyToClipboard = async (text) => {
                        // Сначала пробуем современный Clipboard API с фокусом
                        try {
                            // Пытаемся сфокусироваться на документе
                            window.focus();
                            document.body.focus();
                            
                            await navigator.clipboard.writeText(text);
                            return true; // Успешно
                        } catch (clipboardError) {
                            console.warn('Clipboard API не сработал, пробуем запасной метод:', clipboardError);
                            
                            // Запасной метод с созданием временного элемента
                            try {
                                const textarea = document.createElement('textarea');
                                textarea.value = text;
                                textarea.style.position = 'fixed'; // Предотвращаем прокрутку
                                textarea.style.opacity = '0';
                                document.body.appendChild(textarea);
                                textarea.focus();
                                textarea.select();
                                
                                const successful = document.execCommand('copy');
                                document.body.removeChild(textarea);
                                
                                if (successful) {
                                    return true;
                                } else {
                                    throw new Error('execCommand вернул false');
                                }
                            } catch (fallbackError) {
                                console.error('Запасной метод тоже не сработал:', fallbackError);
                                throw new Error('Не удалось скопировать текст');
                            }
                        }
                    };

                    // Копируем значение cardTitle в буфер обмена
                    try {
                        await copyToClipboard(cardTitle);
                        alert('Название карточки скопировано! Значение: ' + cardTitle);
                    } catch (clipboardError) {
                        console.error('Ошибка при копировании в буфер обмена:', clipboardError);
                        alert('Не удалось скопировать название карточки. Попробуйте выделить текст вручную.');
                        
                        // Дополнительно: показываем текст в консоли и в alert для ручного копирования
                        console.log('Текст для копирования (скопируйте вручную):', cardTitle);
                        prompt('Скопируйте текст вручную (Ctrl+C):', cardTitle);
                    }

                } catch (err) {
                    console.log('Ошибка при получении данных карточки:', err);
                    alert('Произошла ошибка: ' + err.message);
                }
            }
        });
        return buttons;
    }
});
