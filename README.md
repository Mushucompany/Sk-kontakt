# 📨 СК Контакт

Мессенджер в стиле Telegram Premium: тёмная тема, чаты, свои стикеры, анимационные стикеры и Premium-подписка. Работает в браузере и как настольное приложение Windows (EXE).

<p align="center">
  <img src="logo.png" alt="СК Контакт" width="120">
</p>

## ✨ Возможности

- 💬 Чаты с перепиской, сохранение истории в браузере/приложении
- 🔐 Регистрация и вход: почта + пароль, Google / Apple / VK
- 🔢 Уникальный ID в формате `XXXX-XXXX` (например `5003-5003`)
- 📱 Альтернативный способ: вход по номеру телефона `+7 (***) ***-**-**`
- 👥 Добавление контактов по ID, номеру или из сети
- 🎨 Свои паки стикеров (Смайлы, Животные, Еда, Эмоции)
- 🎬 Анимационные стикеры (SVG-анимация)
- ⭐ Premium-подписка: золотые значки, свечение сообщений, радужные темы чата, эксклюзивные стикеры
- 🖼️ Собственная иконка приложения

## 🥇 Premium (199 ₽/мес)

| Функция | Описание |
|---|---|
| 🛡️ Значок Premium | Золотая отметка рядом с именем |
| ✨ Свечение сообщений | Золотой glow исходящих сообщений |
| 🌈 Эффекты чатов | Радужные темы и обои |
| 🎬 Анимационные стикеры | Эксклюзивные паки с анимацией |
| 🎨 Кастомные темы | Свои цвета интерфейса |
| 📊 Аналитика | Статистика профиля |

## 🚀 Запуск

### В браузере
Просто откройте `index.html`:

```bash
start index.html
```

### Как настольное приложение (Windows)
Запустите готовый EXE:

```bash
SKContact.exe
```

> Требуется [.NET 9 Desktop Runtime](https://dotnet.microsoft.com/download/dotnet/9.0) и WebView2 Runtime (входит в Windows 11 / Edge).

**Тестовый аккаунт:**
- Почта: `durnevdaniil921@gmail.com`
- Пароль: `daniil921`

## 🛠️ Сборка EXE из исходников

```bash
cd sk-kontakt/desktop
dotnet publish SKContact.csproj -c Release -r win-x64 --self-contained false
# Результат: desktop/bin/Release/net9.0-windows/win-x64/publish/SKContact.exe
```

Для полностью автономного EXE (не требует .NET на машине):

```bash
dotnet publish SKContact.csproj -c Release -r win-x64 --self-contained true
```

## 📁 Структура проекта

```
sk-kontakt/
├── index.html              # Веб-версия приложения
├── style.css               # Стили (тёмная тема, Telegram Premium)
├── app.js                  # Логика (авторизация, чаты, стикеры, Premium)
├── logo.png                # Иконка 512×512
├── favicon.png             # Фавicon
├── animated-stickers/      # Анимационные стикеры (SVG)
│   ├── heart.svg           # Бьющееся сердце
│   ├── star.svg            # Звезда
│   ├── fire.svg            # Огонь
│   ├── thumbs.svg          # Палец вверх
│   ├── rocket.svg          # Ракета (Premium)
│   ├── party.svg           # Праздник (Premium)
│   ├── smile.svg           # Улыбка
│   └── ghost.svg           # Привидение
├── desktop/                # Исходники настольного приложения (.NET)
│   ├── SKContact.csproj
│   ├── MainForm.cs         # Обёртка WinForms + WebView2
│   ├── Program.cs
│   └── www/                # Копия веб-приложения (ресурсы)
├── make-logo.ps1           # Генератор логотипа
├── make-ico.ps1            # Генератор ICO
└── SKContact.exe           # Готовый настольный билд
```

## 🧰 Технологии

- **Веб-версия:** HTML5, CSS3, Vanilla JavaScript (localStorage для данных)
- **Настольная версия:** .NET 9 (WinForms) + WebView2
- **Иконки:** генерируются PowerShell + System.Drawing

## ⚠️ Обратите внимание

- Данные хранятся локально в `localStorage` (браузер) или `%LocalAppData%\SKContact` (EXE)
- Это демо-проект: «Google / Apple / VK вход» и «Premium» — имитация логики, без реальных серверов

## 📄 Лицензия

[MIT](LICENSE)
