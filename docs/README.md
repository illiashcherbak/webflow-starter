# Webflow Starter Kit

Переиспользуемая система для быстрого старта Webflow-проектов.  
Один CSS + один JS файл. Подключил — работает.

---

## Быстрый старт (15 минут на новый проект)

### 1. Создай новый Webflow проект

### 2. Подключи скрипты

**Project Settings → Custom Code → Head:**

```html
<!-- Стартер CSS -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/YOUR_USER/webflow-starter@1.0.0/css/global.css">

<!-- Переопределение цветов и шрифтов под проект -->
<style>
  :root {
    --color-accent: #e63946;
    --color-accent-hover: #c1121f;
    --font-primary: 'Cabinet Grotesk', sans-serif;
    --font-secondary: 'Satoshi', sans-serif;
  }
</style>
```

**Project Settings → Custom Code → Before `</body>`:**

```html
<!-- GSAP (всегда) -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>

<!-- Swiper (только если нужен слайдер) -->
<script src="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css">

<!-- Lenis (только если нужен smooth scroll) -->
<script src="https://cdn.jsdelivr.net/npm/lenis@1.1.13/dist/lenis.min.js"></script>

<!-- Стартер JS (всегда последний!) -->
<script src="https://cdn.jsdelivr.net/gh/YOUR_USER/webflow-starter@1.0.0/js/global.js" defer></script>
```

### 3. Построй структуру в Webflow

Используй контейнеры и секции по шаблону:

```
section_hero (Section) + padding-section-l (combo class)
  └── container-l (Div)
      └── hero_component (Div)
          └── ...content
```

---

## Контейнеры

| Класс | Max-width | Когда использовать |
|---|---|---|
| `container-s` | 768px | Текстовые блоки, блог, узкие формы |
| `container-m` | 1088px | Большинство секций, карточки, фичи |
| `container-l` | 1280px | Hero, хедер, широкие раскладки |
| `container-full` | 100% | Edge-to-edge (слайдеры, карты) |

Все контейнеры имеют боковые паддинги: 20px (16px на мобильном).

## Секционные отступы

| Класс | Размер | Когда использовать |
|---|---|---|
| `padding-section-s` | 48-80px | CTA, баннеры, компактные блоки |
| `padding-section-m` | 64-112px | Стандартные секции |
| `padding-section-l` | 80-144px | Hero, футер, просторные секции |

Значения fluid — масштабируются через `clamp()` без медиа-запросов.

---

## Компоненты

### Header + Burger

```html
<header class="section_header" data-header>
  <div class="container-l">
    <div class="header_component">
      <a class="header_logo" href="/">Logo</a>
      
      <!-- Desktop nav (скрывается на ≤991px) -->
      <nav class="header_nav">
        <a class="header_nav-link" href="#">About</a>
        <a class="header_nav-link" href="#">Contact</a>
      </nav>
      
      <!-- Burger (виден на ≤991px) -->
      <button class="header_burger" data-burger aria-label="Menu">
        <span class="header_burger-line"></span>
        <span class="header_burger-line"></span>
        <span class="header_burger-line"></span>
      </button>
    </div>
  </div>
  
  <!-- Mobile overlay -->
  <nav class="header_nav-overlay" data-nav-overlay>
    <a href="#">About</a>
    <a href="#">Services</a>
    <a href="#">Contact</a>
  </nav>
</header>
```

**Поведение:**
- Скролл > 50px → добавляется `.is-scrolled` на header (фон + тень)
- Клик по бургеру → `.is-active` на бургере (X-анимация), `.is-open` на оверлее
- Escape → закрывает меню
- Клик по ссылке внутри оверлея → закрывает меню
- Ресайз > 991px → автозакрытие

### Dropdown (в навигации)

```html
<div class="header_dropdown" data-dropdown>
  <button class="header_dropdown-trigger" data-dropdown-trigger>
    Services
  </button>
  <div class="header_dropdown-list" data-dropdown-list>
    <a href="#">Web Design</a>
    <a href="#">Development</a>
  </div>
</div>
```

**Поведение:** hover на десктопе, click на мобильном, Escape закрывает, ARIA-атрибуты автоматически.

### FAQ / Аккордеон

```html
<div class="faq_component" data-accordion-group>
  <div class="faq_item" data-accordion>
    <button class="faq_trigger" data-accordion-trigger>
      <span class="faq_question">Вопрос?</span>
      <span class="faq_icon">+</span>
    </button>
    <div class="faq_content" data-accordion-content>
      <p class="faq_answer">Ответ.</p>
    </div>
  </div>
</div>
```

Для режима "несколько открытых" добавь `data-accordion-multi` на `data-accordion-group`.

### Swiper слайдер

```html
<div class="swiper" data-swiper data-swiper-slides="3" data-swiper-gap="24">
  <div class="swiper-wrapper">
    <div class="swiper-slide">Slide 1</div>
    <div class="swiper-slide">Slide 2</div>
  </div>
  <button data-swiper-prev>←</button>
  <button data-swiper-next>→</button>
  <div data-swiper-pagination></div>
</div>
```

| Data-атрибут | Default | Описание |
|---|---|---|
| `data-swiper-slides` | 1 | Слайдов на десктопе |
| `data-swiper-slides-tablet` | auto | Слайдов на планшете |
| `data-swiper-slides-mobile` | 1 | Слайдов на мобильном |
| `data-swiper-gap` | 16 | Отступ между слайдами (px) |
| `data-swiper-loop` | false | Зацикливание |
| `data-swiper-autoplay` | off | Автопрокрутка (ms) |
| `data-swiper-speed` | 500 | Скорость перехода (ms) |

### Форма с валидацией

```html
<form data-form>
  <input type="email" name="email" required data-validate placeholder="Email">
  <span data-error-for="email" class="u-hide">Введите корректный email</span>
  
  <input type="text" name="name" required data-validate placeholder="Имя">
  <span data-error-for="name" class="u-hide">Имя обязательно</span>
  
  <button type="submit">Отправить</button>
</form>
```

---

## Анимации

### Fade-in при скролле

```html
<h2 data-animate="fade-in">Заголовок</h2>
<p data-animate="fade-in" data-animate-delay="0.2">Текст с задержкой</p>
```

### Stagger (карточки появляются друг за другом)

```html
<div class="services_card" data-animate="stagger">Card 1</div>
<div class="services_card" data-animate="stagger">Card 2</div>
<div class="services_card" data-animate="stagger">Card 3</div>
```

### Scale

```html
<img data-animate="scale" src="..." />
```

### Parallax

```html
<img data-parallax src="..." />
<div data-parallax data-parallax-speed="-20">Медленнее скролла</div>
```

`data-parallax-speed` — отрицательное значение = элемент движется медленнее (классический параллакс). По умолчанию: -15.

---

## Lenis (smooth scroll)

Добавь `data-lenis` на `<body>` чтобы активировать:

```html
<body data-lenis data-lenis-duration="1.2">
```

Якорные ссылки (`#section-id`) автоматически работают с плавным скроллом. Scroll lock при открытом бургер-меню обрабатывается автоматически.

---

## Нейминг классов (Lightweight Client-First)

```
section_[name]          → секции:     section_hero, section_faq
[name]_component        → компонент:  header_component, card_component
[name]_[element]        → дочерний:   header_logo, card_title
container-[size]        → контейнер:  container-s, container-m, container-l
padding-section-[size]  → отступы:    padding-section-s, padding-section-m
is-[state]              → состояние:  is-active, is-open, is-scrolled
data-*                  → JS-хуки:    data-accordion, data-burger
```

**Правило:** JavaScript цепляется ТОЛЬКО за `data-*` атрибуты. Классы — только для стилей.
