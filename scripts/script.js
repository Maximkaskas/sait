'use strict';

// ===== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ =====
let currentSlide = 0;
let isAnimating = false;
let slideTimeout;
let lastScrollTop = 0;
let isTicking = false;

// ===== ОСНОВНОЙ ОБРАБОТЧИК ЗАГРУЗКИ СТРАНИЦЫ =====
document.addEventListener("DOMContentLoaded", () => {
    // 1. Прелоадер и загрузка данных
    const preloader = document.querySelector('.preloader');
    const content = document.querySelector('.content');
    const minLoaderTime = 2000;
    const startTime = Date.now();

    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            const elapsed = Date.now() - startTime;
            const remainingTime = Math.max(minLoaderTime - elapsed, 0);

            renderServices(data);
            initSwiper();

            setTimeout(() => {
                preloader.style.opacity = '0';
                preloader.style.visibility = 'hidden';
                content.style.display = 'block';
            }, remainingTime);
        })
        .catch(error => {
            console.error('Ошибка загрузки данных:', error);
            setTimeout(() => {
                preloader.style.opacity = '0';
                preloader.style.visibility = 'hidden';
                content.style.display = 'block';
            }, minLoaderTime);
        });

    // 2. Обработчики для изображений интенсивов
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

    // 3. Инициализация основных компонентов
    initCarousel();
    startAutoSlide();
    loadFormData('loginForm');
    loadFormData('registerForm');
    animateOnScroll();
    setupEventListeners();

    // 4. Проверка авторизованного пользователя
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
        console.log('Текущий пользователь:', currentUser.name);
    }

    // 5. Глобальные обработчики скролла
    window.addEventListener('scroll', onScroll);
});

// ===== ФУНКЦИИ ДЛЯ РАБОТЫ С КАРУСЕЛЬЮ =====
function initCarousel() {
    const carouselImages = [
        'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1547658719-da2b51169166?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ];

    const carouselContainer = document.getElementById('carouselContainer');
    const carouselControls = document.getElementById('carouselControls');

    // Создаем слайды
    carouselImages.forEach((img, index) => {
        const slide = document.createElement('div');
        slide.className = 'carousel-slide';
        slide.innerHTML = `<img src="${img}" alt="Цифровые продукты ${index + 1}">`;
        carouselContainer.appendChild(slide);
    });

    // Создаем точки управления
    carouselImages.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.className = 'carousel-dot';
        if (index === 0) dot.classList.add('active');
        dot.addEventListener('click', () => {
            if (!isAnimating) {
                goToSlide(index);
            }
        });
        carouselControls.appendChild(dot);
    });

    updateCarousel();
}

function updateCarousel() {
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.carousel-dot');

    slides.forEach((slide, index) => {
        slide.classList.remove('prev', 'active', 'next');
    });

    setTimeout(() => {
        slides.forEach((slide, index) => {
            if (index === currentSlide) {
                slide.classList.add('active');
            } else if (index === (currentSlide - 1 + slides.length) % slides.length) {
                slide.classList.add('prev');
            } else if (index === (currentSlide + 1) % slides.length) {
                slide.classList.add('next');
            }
        });

        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentSlide);
        });

        isAnimating = false;
    }, 10);
}

function goToSlide(index) {
    if (isAnimating) return;
    isAnimating = true;
    currentSlide = index;
    updateCarousel();
}

function nextSlide() {
    if (isAnimating) return;
    isAnimating = true;
    currentSlide = (currentSlide + 1) % document.querySelectorAll('.carousel-slide').length;
    updateCarousel();
}

function prevSlide() {
    if (isAnimating) return;
    isAnimating = true;
    currentSlide = (currentSlide - 1 + document.querySelectorAll('.carousel-slide').length) % document.querySelectorAll('.carousel-slide').length;
    updateCarousel();
}

function startAutoSlide() {
    slideTimeout = setTimeout(() => {
        nextSlide();
        startAutoSlide();
    }, 5000);
}

function stopAutoSlide() {
    clearTimeout(slideTimeout);
}

// ===== ФУНКЦИИ ДЛЯ РЕНДЕРИНГА УСЛУГ =====
function renderServices(services) {
    const servicesContainer = document.getElementById('servicesContainer');
    servicesContainer.innerHTML = '';

    services.forEach(service => {
        const serviceCard = document.createElement('div');
        serviceCard.className = 'swiper-slide service-card animate-on-scroll';
        serviceCard.innerHTML = `
            <div class="service-icon">
                <img src="${service.icon}" alt="${service.iconAlt}" width="${service.iconWidth}" height="${service.iconHeight}">
            </div>
            <h3 class="service-title">${service.title}</h3>
            <p class="service-text">${service.description}</p>
            <a href="${service.link}" class="service-link">Узнать больше <i class="fas fa-arrow-right"></i></a>
        `;
        servicesContainer.appendChild(serviceCard);
    });
}

function initSwiper() {
    const swiper = new Swiper('.mySwiper', {
        slidesPerView: 1,
        spaceBetween: 20,
        loop: true,
        grabCursor: true,
        centeredSlides: true,
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        breakpoints: {
            640: {
                slidesPerView: 2,
            },
            1024: {
                slidesPerView: 3,
                spaceBetween: 30,
            },
        },
    });
}

// ===== ФУНКЦИИ ДЛЯ РАБОТЫ С ФОРМАМИ =====
function saveFormData(formId) {
    const form = document.getElementById(formId);
    const inputs = form.querySelectorAll('input');
    const formData = {};

    inputs.forEach(input => {
        formData[input.id] = input.value;
    });

    localStorage.setItem(formId, JSON.stringify(formData));
}

function loadFormData(formId) {
    const savedData = localStorage.getItem(formId);
    if (savedData) {
        const formData = JSON.parse(savedData);
        const form = document.getElementById(formId);

        Object.keys(formData).forEach(key => {
            const input = form.querySelector(`#${key}`);
            if (input) {
                input.value = formData[key];
            }
        });
    }
}

function handleLoginSubmit(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    saveFormData('loginForm');

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        closeModal(document.getElementById('loginModal'));
        showNotification(`Добро пожаловать, ${user.name}!`, 'success');
    } else {
        showNotification('Неверный email или пароль', 'error');
    }
}

function handleRegisterSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const confirm = document.getElementById('regConfirm').value;

    saveFormData('registerForm');

    if (!name || !email || !password || !confirm) {
        showNotification('Пожалуйста, заполните все поля', 'error');
        return;
    }

    if (password !== confirm) {
        showNotification('Пароли не совпадают', 'error');
        return;
    }

    if (password.length < 6) {
        showNotification('Пароль должен содержать не менее 6 символов', 'error');
        return;
    }

    const users = JSON.parse(localStorage.getItem('users')) || [];
    if (users.some(user => user.email === email)) {
        showNotification('Пользователь с таким email уже зарегистрирован', 'error');
        return;
    }

    const newUser = { name, email, password };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    localStorage.removeItem('registerForm');
    document.getElementById('registerForm').reset();

    closeModal(document.getElementById('loginModal'));
    switchTab('login');
    showNotification('Регистрация прошла успешно!', 'success');
}

// ===== ОБРАБОТЧИКИ СОБЫТИЙ =====
function setupEventListeners() {
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const loginModal = document.getElementById('loginModal');
    const closeLogin = document.getElementById('closeLogin');
    const switchToRegister = document.getElementById('switchToRegister');
    const switchToLogin = document.getElementById('switchToLogin');
    const tabs = document.querySelectorAll('.tab');
    const socialAuthModal = document.getElementById('socialAuthModal');
    const closeSocialAuth = document.getElementById('closeSocialAuth');
    const completeSocialAuth = document.getElementById('completeSocialAuth');
    const demoModal = document.getElementById('demoModal');
    const closeDemo = document.getElementById('closeDemo');
    const startNowBtn = document.getElementById('startNowBtn');
    const demoBtn = document.getElementById('demoBtn');
    const demoRegisterBtn = document.getElementById('demoRegisterBtn');
    const premiumBtn = document.getElementById('premiumBtn');
    const carouselContainer = document.getElementById('carouselContainer');

    loginBtn.addEventListener('click', () => openModal(loginModal));
    registerBtn.addEventListener('click', () => {
        openModal(loginModal);
        switchTab('register');
    });
    startNowBtn.addEventListener('click', () => {
        openModal(loginModal);
        switchTab('register');
    });
    demoBtn.addEventListener('click', () => openModal(demoModal));
    demoRegisterBtn.addEventListener('click', () => {
        demoModal.classList.remove('active');
        openModal(loginModal);
        switchTab('register');
    });
    closeLogin.addEventListener('click', () => closeModal(loginModal));
    closeDemo.addEventListener('click', () => closeModal(demoModal));
    switchToRegister.addEventListener('click', (e) => {
        e.preventDefault();
        switchTab('register');
    });
    switchToLogin.addEventListener('click', (e) => {
        e.preventDefault();
        switchTab('login');
    });
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.getAttribute('data-tab');
            switchTab(tabName);
        });
    });
    premiumBtn.addEventListener('click', activatePremium);
    carouselContainer.addEventListener('mouseenter', stopAutoSlide);
    carouselContainer.addEventListener('mouseleave', startAutoSlide);

    document.getElementById('loginForm').addEventListener('submit', handleLoginSubmit);
    document.getElementById('registerForm').addEventListener('submit', handleRegisterSubmit);
    document.querySelectorAll('#loginForm input, #registerForm input').forEach(input => {
        input.addEventListener('input', function () {
            saveFormData(this.closest('form').id);
        });
    });

    document.querySelectorAll('.social-auth-btn').forEach(button => {
        button.addEventListener('click', handleSocialAuth);
    });
    closeSocialAuth.addEventListener('click', () => socialAuthModal.classList.remove('active'));
    completeSocialAuth.addEventListener('click', completeSocialRegistration);

    document.querySelectorAll('.carousel-slide').forEach(slide => {
        slide.addEventListener('click', () => {
            if (slide.classList.contains('prev')) {
                prevSlide();
            } else if (slide.classList.contains('next')) {
                nextSlide();
            }
        });
    });
}

function handleSocialAuth() {
    const socialAuthModal = document.getElementById('socialAuthModal');
    socialAuthModal.classList.add('active');
}

function completeSocialRegistration() {
    const socialAuthModal = document.getElementById('socialAuthModal');
    socialAuthModal.classList.remove('active');
    showNotification('Регистрация через соцсеть завершена!', 'success');
}

// ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====
function openModal(modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal(modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

function switchTab(tabName) {
    document.querySelectorAll('.tab').forEach(tab => {
        if (tab.getAttribute('data-tab') === tabName) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });

    document.querySelectorAll('.auth-form').forEach(form => {
        if (form.id === `${tabName}Form`) {
            form.classList.add('active');
        } else {
            form.classList.remove('active');
        }
    });
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

function activatePremium(e) {
    e.preventDefault();
    createFireworks();

    const message = document.createElement('div');
    message.className = 'premium-notification';
    message.innerHTML = '<h2>🎉 Премиум активирован! 🎉</h2><p>Теперь вы получили доступ ко всем эксклюзивным функциям!</p>';
    document.body.appendChild(message);

    setTimeout(() => {
        message.classList.add('active');
    }, 10);

    setTimeout(() => {
        message.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(message);
        }, 500);
    }, 3000);
}

function createFireworks() {
    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 10000 };

    function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function () {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
            return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);

        confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });

        if (Math.random() > 0.7) {
            confetti({
                particleCount: 100,
                angle: 60,
                spread: 55,
                origin: { x: 0, y: 0.7 },
                colors: ['#ff0000', '#00ff00', '#0000ff']
            });
            confetti({
                particleCount: 100,
                angle: 120,
                spread: 55,
                origin: { x: 1, y: 0.7 },
                colors: ['#ff0000', '#00ff00', '#0000ff']
            });
        }

        if (Math.random() > 0.8) {
            confetti({
                particleCount: 150,
                spread: 100,
                origin: {
                    x: Math.random(),
                    y: Math.random() * 0.5
                },
                colors: ['#ff5e2f', '#c38cff', '#2b2d42', '#28a745']
            });
        }

    }, 250);
}

function animateOnScroll() {
    const elements = document.querySelectorAll('.animate-on-scroll');

    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;

        if (elementTop < windowHeight - 50) {
            element.classList.add('visible');
        }
    });
}

function onScroll() {
    if (!isTicking) {
        window.requestAnimationFrame(() => {
            animateOnScroll();
            handleHeaderVisibility();
            isTicking = false;
        });
        isTicking = true;
    }
}

function handleHeaderVisibility() {
    const header = document.getElementById('header');
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (scrollTop > lastScrollTop && scrollTop > 100) {
        header.style.transform = 'translateY(-100%)';
    } else {
        header.style.transform = 'translateY(0)';
    }

    lastScrollTop = scrollTop;
}