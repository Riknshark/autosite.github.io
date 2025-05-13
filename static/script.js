const galleryModal = document.getElementById('galleryModal');
const galleryImage = document.getElementById('galleryImage');
const closeBtn = galleryModal.querySelector('.close');
const prevBtn = document.getElementById('prevPhoto');
const nextBtn = document.getElementById('nextPhoto');
const photoCounter = document.getElementById('photoCounter');

let currentCarPhotos = [];
let currentPhotoIndex = 0;

// Получаем данные автомобилей из JSON
const carsData = JSON.parse(document.getElementById('cars-data-json').textContent);

// Функции для работы галереи
function updatePhotoCounter() {
  photoCounter.textContent = currentCarPhotos.length 
    ? `${currentPhotoIndex + 1}/${currentCarPhotos.length}`
    : 'Нет фото';
}

function openGallery(carId) {
  const car = carsData[carId];
  if (!car || !car.images) {
    console.error(`Нет данных для автомобиля: ${carId}`);
    return;
  }
  
  currentCarPhotos = car.images;
  currentPhotoIndex = 0;
  
  if (currentCarPhotos.length > 0) {
    galleryImage.src = currentCarPhotos[0];
    galleryModal.classList.remove('hidden');
    updatePhotoCounter();
  } else {
    console.warn(`Нет фотографий для ${carId}`);
  }
}

function closeGallery() {
  galleryModal.classList.add('hidden');
}

function navigatePhotos(direction) {
  const lastIndex = currentCarPhotos.length - 1;
  
  currentPhotoIndex = direction === 'next' 
    ? (currentPhotoIndex === lastIndex ? 0 : currentPhotoIndex + 1)
    : (currentPhotoIndex === 0 ? lastIndex : currentPhotoIndex - 1);
  
  galleryImage.src = currentCarPhotos[currentPhotoIndex];
  updatePhotoCounter();
}

// Обработчики событий
document.querySelectorAll('.car-card').forEach(card => {
  const btn = card.querySelector('.gallery-hint');
  btn.addEventListener('click', () => {
    const carId = card.dataset.car;
    if (carsData[carId]) {
      openGallery(carId);
    }
  });
});

closeBtn.addEventListener('click', closeGallery);
prevBtn.addEventListener('click', () => navigatePhotos('prev'));
nextBtn.addEventListener('click', () => navigatePhotos('next'));

window.addEventListener('click', (e) => {
  if (e.target === galleryModal) closeGallery();
});

document.addEventListener('keydown', (e) => {
  if (galleryModal.classList.contains('hidden')) return;

  switch(e.key) {
    case 'Escape':
      closeGallery();
      break;
    case 'ArrowLeft':
      navigatePhotos('prev');
      break;
    case 'ArrowRight':
      navigatePhotos('next');
      break;
  }
});

document.getElementById('phone').addEventListener('input', function(e) {
    // Сохраняем позицию курсора и выбор
    const start = this.selectionStart;
    const end = this.selectionEnd;
    const isBackspace = e.inputType === 'deleteContentBackward';
    
    // Получаем очищенные цифры
    let numbers = this.value.replace(/\D/g, '');
    if (!numbers.startsWith('7')) numbers = '7' + numbers;
    numbers = numbers.slice(0, 11); // Ограничение до 11 цифр (7XXXXXXXXXX)
    
    // Форматируем номер
    let formatted = '+7';
    if (numbers.length > 1) {
        formatted += ` (${numbers.slice(1, 4)}`;
        if (numbers.length > 4) formatted += `) ${numbers.slice(4, 7)}`;
        if (numbers.length > 7) formatted += `-${numbers.slice(7, 9)}`;
        if (numbers.length > 9) formatted += `-${numbers.slice(9, 11)}`;
    }
    
    // Обновляем значение
    this.value = formatted;
    
    // Корректируем позицию курсора
    const newPos = this.value.length;
    this.setSelectionRange(isBackspace ? start : newPos, isBackspace ? start : newPos);
    
    // Визуальная индикация
    this.style.borderColor = numbers.length === 11 ? '#4CAF50' : '#ff4444';
});

// Валидация при отправке формы
document.getElementById('phone').addEventListener('blur', function() {
    if (!this.checkValidity()) {
        this.classList.add('invalid');
        this.nextElementSibling.textContent = 'Введите номер в формате: +7 (XXX) XXX-XX-XX';
    }
});

document.getElementById('orderForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const phoneInput = document.getElementById('phone');
  const tgInput = document.getElementById('tg'); // Добавьте поле с id="tg" в HTML

  // Проверка телефона (оставляем вашу текущую логику)
  const numbers = phoneInput.value.replace(/\D/g, '');
  if (numbers.length !== 11 || !numbers.startsWith('7')) {
    phoneInput.style.borderColor = '#ff4444';
    alert('Введите полный номер телефона в формате: +7 (999) 123-45-67');
    return;
  }

  // Валидация Telegram
  let tgValue = tgInput.value.trim();
  const wasTouched = tgInput.dataset.touched === 'true'; // Проверяем, трогал ли пользователь поле

  if (wasTouched) {
    if (!tgValue.startsWith('@') || tgValue.length < 5) {
      tgInput.style.borderColor = '#ff4444';
      alert('Телеграм должен начинаться с @ и содержать минимум 5 символов');
      return;
    }
  } else {
    tgValue = ''; // Если не трогали - очищаем значение
  }

  // Подготовка и отправка данных
  const formData = new FormData(this);
  formData.set('phone', `+${numbers}`);
  formData.set('tg', tgValue);

  fetch('/submit-form', {
    method: 'POST',
    body: formData
  })
  .then(response => {
    if (!response.ok) throw new Error('Ошибка сервера: ' + response.status);
    return response.json();
  })
  .then(data => {
    if(data.success) {
      this.classList.add('hidden');
      document.getElementById('successMessage').classList.remove('hidden');
    } else {
      alert('Ошибка: ' + (data.message || 'Попробуйте ещё раз'));
    }
  })
  .catch(error => {
    console.error('Error:', error);
    alert('Ошибка соединения: ' + error.message);
  });
});

// Обработчики для поля Telegram
const tgInput = document.getElementById('tg');
tgInput.addEventListener('focus', function() {
  if (!this.value) {
    this.value = '@';
    this.setSelectionPosition(1); // Курсор после @
  }
  this.dataset.touched = 'true';
});

tgInput.addEventListener('input', function(e) {
  if (!this.value.startsWith('@')) {
    this.value = '@' + this.value.replace(/@/g, '');
    this.setSelectionPosition(this.value.length);
  }
  this.dataset.touched = 'true';
});

// Хелпер для установки позиции курсора
HTMLInputElement.prototype.setSelectionPosition = function(position) {
  this.focus();
  this.setSelectionRange(position, position);
};

// В script.js заменить анимацию на
function animateSteps() {
  const steps = document.querySelectorAll('.step');
  const triggerBottom = window.innerHeight * 0.8;
  
  steps.forEach(step => {
    const stepTop = step.getBoundingClientRect().top;
    if (stepTop < triggerBottom) {
      step.style.opacity = '1';
      step.style.transform = 'translateY(0)';
    }
  });
}
// Плавная прокрутка для якорных ссылок
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if(target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
      
      // Закрытие мобильного меню
      document.querySelector('.hamburger').classList.remove('active');
      document.querySelector('nav').classList.remove('active');
    }
  });
});

// Адаптация формы
window.addEventListener('resize', () => {
  const phoneInput = document.getElementById('phone');
  if(window.innerWidth < 768) {
    phoneInput.placeholder = "+7 (###) ###-##-##";
  } else {
    phoneInput.placeholder = "+7 (___) ___-__-__";
  }
});