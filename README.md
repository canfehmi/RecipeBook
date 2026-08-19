# 🍲 Ata Tarifi

> A family-oriented digital recipe book where users can discover recipes, create their own private recipes, and build a shared recipe collection with their family.

🌐 **Live:** https://atatarifi.com

💻 **GitHub:** https://github.com/canfehmi

---

## 📖 About

**Ata Tarifi** is a modern recipe management platform designed to solve a simple but common problem:

Family recipes are often scattered across notebooks, WhatsApp messages, phone notes, or different websites and can easily become difficult to find or even get lost over time.

Ata Tarifi brings these recipes together in one place.

The platform allows users to:

- Discover publicly available global recipes
- Create their own recipes
- Build a private recipe collection
- Create a family
- Invite family members
- Share a common family recipe book
- Preserve family recipes for future generations

The core idea behind Ata Tarifi is not simply to provide recipes, but to create a **digital family recipe book** that can be used and maintained collectively.

---

# ✨ Features

## 🔐 Authentication & Authorization

Ata Tarifi uses a secure authentication and authorization system built on ASP.NET Core Identity and JWT.

Features include:

- User Registration
- User Login
- JWT Authentication
- ASP.NET Core Identity
- Google Authentication
- Secure Password Management
- Role-Based Authorization
- Protected API endpoints
- User-specific data authorization

Authentication and authorization are handled on the backend to ensure that users can only access resources they are authorized to access.

---

# 🌎 Global Recipes

Global recipes are publicly available recipes that can be discovered by all users.

Users can:

- Browse global recipes
- Search recipes
- Filter recipes by category
- View detailed recipe information
- View recipe ingredients and preparation steps
- Copy a global recipe to their own recipe book

### 🔒 Read-Only Global Recipes

Global recipes are centrally managed.

Regular users cannot:

- Edit global recipes
- Delete global recipes
- Modify global recipe content

Users can only copy a global recipe into their own recipe book.

This keeps the global recipe collection consistent while allowing users to personalize their own recipe books.

---

# 📒 Personal Recipe Book

Every user can create and manage their own recipe collection.

Users can:

- Save global recipes to their recipe book
- Create recipes from scratch
- Edit their own recipes
- Delete their own recipes
- Upload recipe images
- Manage their personal recipe collection

Private recipes created by a user are not publicly accessible.

The application enforces authorization at the API level so users cannot access another user's private recipes simply by changing an ID or URL.

---

# 👨‍👩‍👧‍👦 Family Recipe Book

The **Family System** is one of the core features of Ata Tarifi.

Users can create a family and invite other registered users using an invitation code.

Family members can then share a common recipe book.

Each family has its own private recipe collection that is accessible only to members of that family.

---

## 👑 Family Roles

Each family has its own internal hierarchy.

A family can have:

- Minimum **1 Family Elder**
- Maximum **2 Family Elders**
- One or more Family Members

### Family Elders

Family Elders are responsible for managing the family.

They can:

- Approve family join requests
- Reject family join requests
- Remove family members
- Promote members to Family Elder
- Demote Family Elders when permitted
- Approve new family recipes
- Reject submitted recipes
- Manage the shared family recipe collection

### Family Members

Family Members can:

- View the family recipe book
- Submit new recipes
- Use recipes shared within the family
- Participate in the family's shared recipe collection

When a family member creates a new recipe, the recipe does not immediately become part of the shared family recipe book.

It first requires approval from a Family Elder.

This creates a controlled and family-oriented recipe management system.

---

# 🔒 Privacy & Data Isolation

Privacy is one of the fundamental principles of Ata Tarifi.

The platform separates:

- Global recipes
- Personal recipes
- Family recipes

### Global Recipes

Visible to everyone.

### Personal Recipes

Visible only to the user who created or saved them.

### Family Recipes

Visible only to members of the corresponding family.

Users cannot access another user's private recipes or another family's private recipe collection.

Authorization is enforced on the backend rather than relying only on frontend restrictions.

---

# 🖼️ Recipe Images

Ata Tarifi uses **Cloudinary** for recipe image management.

Users can:

- Upload recipe images
- Update recipe images
- Delete recipe images

Cloudinary handles image storage and delivery while the application stores the necessary image references.

---

# 🛠️ Tech Stack

## Backend

- ASP.NET Core Web API
- .NET
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
- RESTful API

---

## Frontend

- React
- Vite
- React Router
- Axios
- React Hook Form
- Context API

---

## Infrastructure & Services

- SQL Server
- Cloudinary
- Google Authentication
- JWT
- SMTP / Email Services

---

# 🏗️ Architecture

Ata Tarifi follows a **Clean Architecture** approach to keep the application maintainable, testable and loosely coupled.

Ata Tarifi
│
├── Domain
│   ├── Entities
│   └── Enums
│
├── Application
│   ├── Constants
│   ├── DTOs
│   ├── Exceptions
│   ├── Helpers
│   ├── Options
│   ├── Security
│   ├── Services
│   └── Interfaces
│
├── Infrastructure
│   ├── EmailTemplates
│   ├── Email
│   ├── Data
│   ├── Options
│   └── Services
│
└── WebAPI
    ├── Controllers
    ├── Properties
    └── Program.cs

Frontend
│
├── api
├── public
├── scripts
├── server
└── src

# 🔄 Core Application Flow

The main Ata Tarifi workflow can be summarized as:

User Registration / Login
          │
          ▼
      User Account
          │
          ├───────────────┐
          │               │
          ▼               ▼
   Global Recipes     Family System
          │               │
          ▼               ▼
   Copy Recipe       Create / Join Family
          │               │
          ▼               ▼
   Personal Book      Family Recipe Book
                              │
                              ▼
                       Submit Recipe
                              │
                              ▼
                       Elder Approval
                              │
                              ▼
                     Shared Family Recipe

# 🚀 Getting Started

## Prerequisites

Before running Ata Tarifi locally, make sure you have:

- .NET SDK
- SQL Server
- Node.js
- npm
- Git

You will also need configuration for:

- Cloudinary
- Google OAuth
- SMTP / Email service

---

## 1. Clone the Repository

    git clone https://github.com/canfehmi/AtaTarifi.git
    cd AtaTarifi

---

## 2. Backend Setup

Navigate to the backend project:

    cd Backend

Restore NuGet packages:

    dotnet restore

Configure the following settings in `appsettings.json` or `appsettings.Development.json`:

- SQL Server connection string
- JWT settings
- Google Authentication
- Cloudinary
- SMTP / Email settings

Apply Entity Framework Core migrations:

    dotnet ef database update

Start the API:

    dotnet run

---

## 3. Frontend Setup

Open another terminal and navigate to the frontend project:

    cd Frontend

Install dependencies:

    npm install

Start the development server:

    npm run dev

---

# 🔐 Environment Configuration

Sensitive configuration values should never be committed to the repository.

The backend requires configuration for:

- Database connection
- JWT
- Google Authentication
- Cloudinary
- SMTP / Email

Example configuration structure:

    {
      "ConnectionStrings": {
        "DefaultConnection": "YOUR_CONNECTION_STRING"
      },
      "Jwt": {
        "Key": "YOUR_SECRET_KEY",
        "Issuer": "YOUR_ISSUER",
        "Audience": "YOUR_AUDIENCE"
      },
      "Google": {
        "ClientId": "YOUR_CLIENT_ID",
        "ClientSecret": "YOUR_CLIENT_SECRET"
      },
      "Cloudinary": {
        "CloudName": "YOUR_CLOUD_NAME",
        "ApiKey": "YOUR_API_KEY",
        "ApiSecret": "YOUR_API_SECRET"
      }
    }

Never commit:

- Database passwords
- JWT secrets
- Google Client Secrets
- Cloudinary API secrets
- SMTP passwords
- Other sensitive credentials

---

# 🌍 Production

Ata Tarifi is deployed as a real production application.

**Frontend**

https://atatarifi.com

**Backend API**

https://api.atatarifi.com

The frontend and backend are deployed separately and communicate through the REST API.

---

# 📱 Responsive Design

Ata Tarifi is designed to work across desktop and mobile screen sizes.

The application is especially designed for recipe browsing and recipe management scenarios where users may access their recipe book while cooking.

A native mobile application is planned for a future release.

---

# 🧪 Security & Authorization

Security and data isolation are important parts of the Ata Tarifi architecture.

The application uses:

- JWT Authentication
- ASP.NET Core Identity
- Google Authentication
- Role-Based Authorization
- User-specific resource authorization
- Family-specific resource authorization
- Protected administrative operations

The frontend is not treated as the security boundary.

Authorization rules are enforced by the backend API.

This ensures that private resources cannot be accessed simply by manipulating URLs, route parameters or recipe IDs.

---

# 🗺️ Roadmap

Ata Tarifi is actively being developed.

## Planned Features

- [ ] Favorite Recipes
- [ ] Shopping List
- [ ] Weekly Meal Planner
- [ ] Advanced Recipe Search
- [ ] Advanced Recipe Filtering
- [ ] Recipe Ratings
- [ ] Recipe Comments
- [ ] Email Notifications
- [ ] Progressive Web App (PWA)
- [ ] Native Mobile Application
- [ ] Offline Recipe Access

---

# 🔮 Future Vision

The long-term goal of Ata Tarifi is to evolve from a recipe management platform into a broader **digital cooking and family recipe ecosystem**.

Future improvements may include:

- 🤖 AI-powered recipe suggestions
- 🛒 Smart shopping lists
- 📅 Meal planning
- 🥗 Nutrition information
- 📱 Native mobile application
- 🔔 Push notifications
- 📦 Offline recipe access
- 📷 Improved recipe creation with mobile camera support

---

# 🎯 Project Goals

Ata Tarifi was built around several core goals.

### Preserve Family Recipes

Help families digitally preserve recipes that have traditionally been stored in notebooks, messages or personal notes.

### Create Private Recipe Collections

Give users a secure place to store their own recipes.

### Enable Family Collaboration

Allow family members to build and maintain a shared recipe collection.

### Protect Private Data

Ensure that personal and family recipes are only accessible to authorized users.

### Build a Real Product

Ata Tarifi is designed not only as a portfolio project, but as a real-world product that can be used by real users and continuously improved through user feedback.

---

# 🤝 Contributing

Ata Tarifi is currently developed and maintained by **Fehmi ÜN**.

Suggestions, bug reports and feature ideas are welcome.

Feel free to:

- Open an Issue
- Submit a Pull Request
- Share feedback

---

# 📄 License

This project is licensed under the MIT License.

See the `LICENSE` file for details.

---

# 👨‍💻 Developer

## Fehmi ÜN

Full Stack Developer focused on **ASP.NET Core, React and modern web application development.**

**GitHub**

https://github.com/canfehmi

**LinkedIn**

https://www.linkedin.com/in/fehmi-%C3%BCn-136542314/

---

# ⭐ Support

If you find Ata Tarifi interesting, consider giving the repository a ⭐.

Your feedback and suggestions are always welcome.

---

# 🍲 Ata Tarifi

**A digital family recipe book for preserving recipes, sharing memories and keeping family traditions alive.**

🌐 https://atatarifi.com

💻 https://github.com/canfehmi
