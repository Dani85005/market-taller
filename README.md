#  Market-Taller

Sistema de gestión de pedidos y productos para taller, con arquitectura hexagonal (puertos y adaptadores) en el backend y React en el frontend.

---

## Descripción

Market Taller es una aplicación web que permite gestionar usuarios, productos y pedidos, con autenticación mediante captcha y control de acceso por roles (administrador, productor, pedido).

El proyecto está dividido en dos partes:
- **Backend:** API REST con Node.js, Express y PostgreSQL.
- **Frontend:** Interfaz de usuario con React + Vite.

---

## Arquitectura

El backend sigue el patrón de **Arquitectura Hexagonal**, separando claramente las capas:

**Inyección de dependencias:** se realiza en `src/server.js` (composition root), donde se instancian los adaptadores concretos y se inyectan en los servicios.

---

## Tecnologías

**Backend:**
- Node.js
- Express
- PostgreSQL
- bcrypt (encriptación de contraseñas)
- Captcha SVG dinámico

**Frontend:**
- React
- Vite
- JavaScript / CSS

**Documentación:**
- LaTeX (Overleaf)

---

## Estructura del proyecto
market-taller/
├── backend/ # API REST (Node.js + Express + PostgreSQL)
│ ├── database.sql
│ ├── package.json
│ └── src/
│ ├── domain/ # Entidades y puertos
│ ├── application/ # Casos de uso (servicios)
│ ├── infrastructure/ # Adaptadores (PostgreSQL, Captcha)
│ ├── interfaces/ # Controladores HTTP
│ └── server.js # Composition root
├── frontend/ # Interfaz de usuario (React + Vite)
│ ├── package.json
│ └── src/
├── documentacion/ # Reporte técnico en LaTeX
│ └── main.tex
├── .gitignore
└── README.md

---

## Instalación y ejecución

### Requisitos previos

- Node.js (v18 o superior)
- PostgreSQL
- Git

### 1. Clonar el repositorio

```bash
git clone https://github.com/Dani85005/market-taller.git
cd market-taller

