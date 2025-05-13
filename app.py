from flask import Flask, render_template, url_for, request, jsonify
import os
import requests

app = Flask(__name__)

# Конфигурация Telegram (замените на свои данные)
TELEGRAM_TOKEN = '8045402789:AAGFch0JKhlJ0FfHYwDcQMdGTlqQgFViYHg'
TELEGRAM_CHAT_ID = '1098177968'

def get_car_images(car_brand):
    """Получает список изображений для указанного автомобиля"""
    images = []
    car_folder = os.path.join(app.static_folder, 'images', car_brand)
    
    try:
        if os.path.exists(car_folder):
            for filename in sorted(os.listdir(car_folder)):
                if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.webp')):
                    img_url = url_for('static', filename=f'images/{car_brand}/{filename}')
                    images.append(img_url)
    except Exception as e:
        app.logger.error(f"Ошибка загрузки изображений {car_brand}: {str(e)}")
    
    return images

def send_telegram_message(message):
    url = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage"
    payload = {
        'chat_id': TELEGRAM_CHAT_ID,
        'text': message,
        'parse_mode': 'HTML'
    }
    try:
        response = requests.post(url, data=payload)
        return response.ok
    except Exception as e:
        app.logger.error(f"Ошибка отправки в Telegram: {str(e)}")
        return False

@app.route('/')
def index():
    cars_data = {
        'Honda1': {
            'name': 'Honda CR-V',
            'images': get_car_images('Honda CR-V'),
            'prices': {
                'market': '2 000 000 ₽',
                'order': '1 850 000 ₽',
                'full': '1 980 000 ₽'
            }
        },
        'Toyota1': {
            'name': 'Toyota Corolla Fielder',
            'images': get_car_images('Toyota Corolla Fielder'),
            'prices': {
                'market': '1 900 000 ₽',
                'order': '1 700 000 ₽',
                'full': '1 850 000 ₽'
            }
        },
        'Volkswagen': {
            'name': 'Volkswagen Tayron',
            'images': get_car_images('Volkswagen Tayron'),
            'prices': {
                'market': '2 100 000 ₽',
                'order': '1 950 000 ₽',
                'full': '2 080 000 ₽'
            }
        },
        'Honda2': {
            'name': 'Honda Shuttle',
            'images': get_car_images('Honda Shuttle'),
            'prices': {
                'market': '2 100 000 ₽',
                'order': '1 950 000 ₽',
                'full': '2 080 000 ₽'
            }
        },
        'Toyota': {
            'name': 'Toyota Corolla Cross',
            'images': get_car_images('Toyota Corolla Cross'),
            'prices': {
                'market': '1 900 000 ₽',
                'order': '1 700 000 ₽',
                'full': '1 850 000 ₽'
            }
        }
    }   
    return render_template('index.html', cars_data=cars_data)

@app.route('/submit-form', methods=['POST'])
def handle_form():
    data = request.form
    car_model = data.get('car', 'Не указана')  # Получаем значение напрямую из поля

    message = (
        f"<b>Новая заявка!</b>\n"
        f"Модель: {car_model}\n"  # Используем введенное пользователем значение
        f"Имя: {data.get('name', 'Не указано')}\n"
        f"Телефон: {data.get('phone', 'Не указан')}\n"
        f"Email: {data.get('email', 'Не указан')}\n"
        f"Telegram: {data.get('tg', 'Не указан')}"
    )

    if send_telegram_message(message):
        return jsonify({'success': True})
    return jsonify({'success': False}), 500

if __name__ == '__main__':
    app.run(
        debug=True,
        extra_files=[
            './templates/**/*',
            './static/**/*'
        ],
        port=5000
    )