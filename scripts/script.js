'use strict';
document.addEventListener("DOMContentLoaded", () => {
    // * 1. Начало.
    // * 2. Получаем все элементы изображений с описанием.
    // * 3. Для каждого изображения (проверяем есть ли такие изображения):
    // *    3.1. Добавляем обработчик наведения курсора на изображение:
    // *        3.1.1. Да:
    // *            3.1.1.1. показываем текст при наведении.
    // *            3.1.2. Нет: продолжаем.
    // *    3.2. Добавляем обработчик курсор уходит с изображения:   
    // *        3.3.1. Да:
    // *            3.3.1.1. Скрываем элемент с описанием.
    // *          3.3.2. Нет: пролдолжаем.
    // * 4. Конец
    
    const intensiveImg = document.querySelector(".promo__image");
    intensiveImg.addEventListener('mouseenter', () => {
            console.log('Мышка наведена на изображение, показываем текст');
     });
});

const intensiveImg = document.querySelectorAll('.intensive__img');
const intensiveText = document.querySelectorAll('.intensive__description');

intensiveImg.forEach((item, index) => {
  item.addEventListener('mouseenter', () => {
    item.style.opacity = 0.5;
    intensiveText[index].removeAttribute('hidden');
  });

  item.addEventListener('mouseleave', () => {
    item.style.opacity = 1;
    intensiveText[index].setAttribute('hidden', true);
  });
});
