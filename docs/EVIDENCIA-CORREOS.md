# Subsistema de notificaciones por correo

El sistema no procesa pagos en línea. Cada pedido se registra como
`pendiente_de_pago` y dispara dos correos: uno al cliente con el desglose y los
datos bancarios, y otro al administrador avisando del pedido nuevo.

## 1. Diagrama de arquitectura actualizado

```mermaid
graph TB
    UI[React: Checkout]

    subgraph Interfaces["Interfaces (entrada)"]
        PdC[pedidoController]
    end

    subgraph Application["Application"]
        PdS[PedidoService]
        TPL[emailTemplates]
    end

    subgraph Domain["Domain"]
        PdD[Pedido - pendiente_de_pago]
        ESP[EmailServicePort - NUEVO]
        PdP[PedidoRepositoryPort]
    end

    subgraph Infrastructure["Infrastructure (salida)"]
        NA[NodemailAdapter - NUEVO]
        PdA[PedidoRepositoryAdapter]
    end

    SMTP[(Servidor SMTP: Gmail / Ethereal)]
    DB[(PostgreSQL)]

    UI -->|POST /pedidos| PdC
    PdC --> PdS
    PdS --> PdD
    PdS --> TPL
    PdS --> ESP
    PdS --> PdP
    ESP -.implementa.-> NA
    PdP -.implementa.-> PdA
    NA -->|SMTP| SMTP
    PdA --> DB
```

`PedidoService` solo conoce `EmailServicePort`. Nodemailer se importa
únicamente en `NodemailAdapter`, y el proveedor de correo se elige con
variables de entorno (`SMTP_*`), sin tocar el dominio ni la lógica del pedido.

## 2. Código fuente

| Capa | Archivo |
|---|---|
| Domain (puerto) | `backend/src/domain/emailServicePort.js` |
| Domain (entidad) | `backend/src/domain/pedido.js` |
| Application | `backend/src/application/pedidoService.js` |
| Application (plantillas) | `backend/src/application/emailTemplates.js` |
| Infrastructure (adaptador) | `backend/src/infrastructure/nodemailAdapter.js` |
| Infrastructure (repositorio) | `backend/src/infrastructure/pedidoRepositoryAdapter.js` |
| Interfaces | `backend/src/interfaces/pedidoController.js` |
| Composition root | `backend/src/server.js` |
| Frontend (checkout) | `frontend/src/DashboardPedido.jsx` |

## 3. Evidencia de pruebas de envío

### Checkout en React
![Checkout](evidencia-correos/01-checkout.png)

### Pedido registrado
![Pedido registrado](evidencia-correos/02-pedido-registrado.png)

### Backend enviando los correos
![Terminal del backend](evidencia-correos/03-terminal-backend.png)

### Correo recibido por el cliente (desglose y datos bancarios)
![Correo del cliente](evidencia-correos/04-correo-cliente.png)

### Correo recibido por el administrador
![Correo del administrador](evidencia-correos/05-correo-admin.png)

### Pedido guardado en PostgreSQL con estado pendiente_de_pago
![Tabla pedidos](evidencia-correos/06-tabla-pedidos.png)

### Pruebas con bandeja de pruebas (Ethereal)
![Ethereal cliente](evidencia-correos/07-ethereal-cliente.png)
![Ethereal administrador](evidencia-correos/08-ethereal-admin.png)
