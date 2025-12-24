# ⚔️ Zentrix RPG — Microservices Battle System

A production-ready **RPG backend system** built on a clean **microservices architecture**.  
Players create characters, manage equipment, and fight turn-based duels with **automatic loot distribution** — all fully containerized and runnable with a single command.

This project demonstrates **real-world backend patterns**: service isolation, async workflows, caching, and infrastructure automation.

---

## 🏗️ Architecture Overview

The system is composed of **three independent services**, each owning its **own database** (strict data isolation).

### 🔐 Account Service
- JWT authentication
- Role-based access control (`User`, `GameMaster`)
- Central identity provider for the system

### 👤 Character Service
- Character creation & class management
- Item ownership, granting, and gifting
- **Redis caching** for character stats (performance optimization)

### ⚔️ Combat Service
- Duel orchestration
- Turn-based actions:
  - `Attack`
  - `Cast`
  - `Heal`
- Automatic loot transfer to the winner

---

## 🛠️ Tech Stack

| Layer           | Technology                         |
|-----------------|-------------------------------------|
| Backend         | Node.js, TypeScript, Express        |
| ORM / DB        | PostgreSQL, TypeORM                 |
| Caching         | Redis                               |
| Infrastructure | Docker, Docker Compose              |
| Auth            | JWT                                 |

---

## 🚀 Getting Started

### 1️⃣ Prerequisites

Make sure you have the following installed:
- Docker
- Docker Compose
- jq (command-line JSON processor)

---

### 2️⃣ Installation & Startup

Start **all services, databases, migrations, and seeders** with a single command:

```bash
docker-compose up --build
```
Database migrations and initial seeding (classes, base items) run automatically on startup.

---

## 🔐 Environment Configuration

Each service uses its own isolated environment configuration.  
Environment files (`.env`) are intentionally excluded from version control.

Before starting the system, create `.env` files from the provided examples:

```bash
cp services/account-service/.env.example services/account-service/.env
cp services/character-service/.env.example services/character-service/.env
cp services/combat-service/.env.example services/combat-service/.env


### 3️⃣ End-to-End Simulation

To validate the entire system flow — from registration to combat and loot transfer — run:

```bash
chmod +x simulate_rpg.sh
npm run simulation
```

This script performs:

- User registration & login
- Character creation
- Item granting & gifting
- Combat initiation

---

### 🧪 Testing

Unit tests cover core business logic, including:

- Stat calculations
- Dynamic naming rules
- Service-level behavior

Run all tests from the project root:
```bash
npm test
```
---
Developed by Dejan Vitomirov as an entry task for Zentrix Lab.