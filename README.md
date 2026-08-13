# 🍽️ Ata Tarifi

> A modern recipe management platform where users can build their own private recipe book, save global recipes and collaborate with family members.

![GitHub last commit](https://img.shields.io/github/last-commit/USERNAME/AtaTarifi)
![GitHub repo size](https://img.shields.io/github/repo-size/USERNAME/AtaTarifi)
![GitHub stars](https://img.shields.io/github/stars/USERNAME/AtaTarifi?style=social)

---

# 📖 About

Ata Tarifi is not just another recipe application.

It is a personal and family-oriented recipe management platform that allows users to securely store their recipes, build their own digital recipe book, and collaborate with family members through a shared recipe collection.

Instead of simply browsing recipes, users can create their own private cooking archive and preserve family recipes in one place.

---

# ✨ Features

## 🔐 Authentication

- User Registration
- User Login
- JWT Authentication
- ASP.NET Core Identity
- Google Authentication
- Role Based Authorization

---

## 🍲 Global Recipes

- Browse recipes
- Recipe Categories
- Search Recipes
- Filter by Category
- Detailed Recipe Page

---

## 📒 Personal Recipe Book

Every user has a private recipe book.

Users can

- Save global recipes
- Create their own recipes
- Edit recipes
- Delete recipes
- Upload recipe images
- Manage personal recipe collection

Private recipes are only visible to their owner.

---

## 👨‍👩‍👧‍👦 Family System

One of the core features of Ata Tarifi.

Users can

- Create a family
- Invite members with invitation codes
- Join families
- Share a common recipe book
- Manage family members
- Promote/Demote family roles
- Remove members

Every family has its own shared recipe collection.

---

## 👑 Admin Panel

Administrators can manage

- Recipes
- Categories
- Users
- Uploaded Images

---

## ☁️ Image Management

Recipe images are uploaded securely using Cloudinary.

Features include

- Upload Images
- Update Images
- Delete Images

---

# 🛠 Tech Stack

## Backend

- ASP.NET Core Web API
- Clean Architecture
- Entity Framework Core
- SQL Server
- ASP.NET Core Identity
- JWT Authentication
- Google OAuth
- AutoMapper
- FluentValidation
- MediatR
- Repository Pattern
- Dependency Injection

---

## Frontend

- React
- React Router
- Axios
- React Hook Form
- Context API

---

## Cloud

- Cloudinary

---

# 📂 Architecture

```
Ata Tarifi

├── Domain
├── Application
├── Persistence
├── Infrastructure
├── WebAPI

Frontend

├── Components
├── Pages
├── Hooks
├── Services
├── Context
├── Layouts
```

---


# 🚀 Getting Started

## Clone the repository

```bash
git clone https://github.com/USERNAME/AtaTarifi.git
```

Backend

```bash
cd Backend
```

Install packages

```bash
dotnet restore
```

Run migrations

```bash
dotnet ef database update
```

Start API

```bash
dotnet run
```

Frontend

```bash
cd Frontend
```

Install packages

```bash
npm install
```

Run project

```bash
npm run dev
```

---

# 🔐 Environment Variables

Create an `appsettings.json` file.

```
ConnectionStrings

Jwt

Google Authentication

Cloudinary

Mail Settings
```

---

# 🗺 Roadmap

- [x] Authentication
- [x] Google Login
- [x] JWT Authentication
- [x] Global Recipes
- [x] Personal Recipe Book
- [x] Family System
- [x] Cloudinary Integration
- [x] Admin Panel

### Planned Features

- [ ] Favorites
- [ ] Shopping List
- [ ] Weekly Meal Planner
- [ ] Nutrition Information
- [ ] Recipe Ratings
- [ ] Comments
- [ ] Email Notifications
- [ ] Mobile Responsive Improvements

---

# 🎯 Project Goals

Ata Tarifi aims to provide a modern digital cookbook where users can

- Preserve family recipes
- Build a personal recipe archive
- Share recipes securely with family members
- Access recipes anywhere

---

# 📈 Future Vision

Ata Tarifi is planned to become more than a recipe application.

Future releases will include

- AI Recipe Suggestions
- Smart Shopping Lists
- Meal Planning
- Nutrition Tracking
- Mobile Application
- Progressive Web App (PWA)

---

# 🤝 Contributing

Contributions, ideas and feedback are always welcome.

Feel free to open an Issue or submit a Pull Request.

---

# 📄 License

This project is licensed under the MIT License.

---

# 👨‍💻 Developer

**Fehmi ÜN**

GitHub

https://github.com/canfehmi

LinkedIn

https://www.linkedin.com/in/fehmi-%C3%BCn-136542314/

---

⭐ If you like this project, don't forget to leave a star!
