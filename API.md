# 📚 Documentação da API - QuadraCerta

Base URL: `http://localhost:5000/api`

## 🔐 Autenticação

Todas as rotas protegidas requerem um token JWT no header:
```
Authorization: Bearer <token>
```

---

## 👤 Autenticação

### POST /auth/register
Registra um novo complexo e usuário admin.

**Request Body:**
```json
{
  "firstName": "João",
  "lastName": "Silva",
  "email": "joao@email.com",
  "password": "senha123",
  "cpf": "123.456.789-00",
  "cnpj": "12.345.678/0001-90",
  "complexName": "Arena Sports",
  "phone": "(51) 99999-9999"
}
```

**Response (201):**
```json
{
  "message": "Usuário e complexo cadastrados com sucesso!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "firstName": "João",
    "lastName": "Silva",
    "email": "joao@email.com",
    "role": "ADMIN",
    "complexId": "uuid"
  }
}
```

### POST /auth/login
Realiza login no sistema.

**Request Body:**
```json
{
  "email": "joao@email.com",
  "password": "senha123"
}
```

**Response (200):**
```json
{
  "message": "Login realizado com sucesso!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "firstName": "João",
    "lastName": "Silva",
    "email": "joao@email.com",
    "role": "ADMIN",
    "complexId": "uuid",
    "complex": {
      "id": "uuid",
      "name": "Arena Sports"
    }
  }
}
```

### GET /auth/me
Retorna dados do usuário autenticado.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "id": "uuid",
  "firstName": "João",
  "lastName": "Silva",
  "email": "joao@email.com",
  "cpf": "123.456.789-00",
  "phone": "(51) 99999-9999",
  "role": "ADMIN",
  "complexId": "uuid",
  "complex": {
    "id": "uuid",
    "name": "Arena Sports",
    "cnpj": "12.345.678/0001-90"
  }
}
```

---

## 🏟️ Quadras

### GET /courts
Lista todas as quadras do complexo.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
[
  {
    "id": "uuid",
    "name": "Quadra 1",
    "sportType": "Futebol",
    "capacity": 14,
    "pricePerHour": 120.00,
    "description": "Quadra de grama sintética",
    "status": "AVAILABLE",
    "complexId": "uuid",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
]
```

### GET /courts/:id
Busca uma quadra específica.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "id": "uuid",
  "name": "Quadra 1",
  "sportType": "Futebol",
  "capacity": 14,
  "pricePerHour": 120.00,
  "description": "Quadra de grama sintética",
  "status": "AVAILABLE",
  "complexId": "uuid",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

### POST /courts
Cria uma nova quadra.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "Quadra 1",
  "sportType": "Futebol",
  "capacity": 14,
  "pricePerHour": 120.00,
  "description": "Quadra de grama sintética"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "name": "Quadra 1",
  "sportType": "Futebol",
  "capacity": 14,
  "pricePerHour": 120.00,
  "description": "Quadra de grama sintética",
  "status": "AVAILABLE",
  "complexId": "uuid",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

### PUT /courts/:id
Atualiza uma quadra.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "Quadra 1 - Atualizada",
  "status": "MAINTENANCE"
}
```

**Response (200):** Retorna a quadra atualizada.

### DELETE /courts/:id
Deleta uma quadra.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "message": "Quadra deletada com sucesso."
}
```

---

## 👥 Clientes

### GET /clients
Lista todos os clientes do complexo.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
[
  {
    "id": "uuid",
    "fullName": "Carlos Eduardo",
    "phone": "(51) 99999-8888",
    "email": "carlos@email.com",
    "cpf": "111.222.333-44",
    "complexId": "uuid",
    "_count": {
      "reservations": 5,
      "tabs": 3
    }
  }
]
```

### GET /clients/:id
Busca um cliente com histórico completo.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "id": "uuid",
  "fullName": "Carlos Eduardo",
  "phone": "(51) 99999-8888",
  "email": "carlos@email.com",
  "cpf": "111.222.333-44",
  "complexId": "uuid",
  "reservations": [
    {
      "id": "uuid",
      "startTime": "2025-01-15T18:00:00.000Z",
      "endTime": "2025-01-15T19:00:00.000Z",
      "court": {
        "name": "Quadra 1"
      }
    }
  ],
  "tabs": [
    {
      "id": "uuid",
      "total": 21.00,
      "status": "PAID",
      "items": [...]
    }
  ]
}
```

### POST /clients
Cria um novo cliente.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "fullName": "Carlos Eduardo",
  "phone": "(51) 99999-8888",
  "email": "carlos@email.com",
  "cpf": "111.222.333-44"
}
```

**Response (201):** Retorna o cliente criado.

### PUT /clients/:id
Atualiza um cliente.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "fullName": "Carlos Eduardo Silva",
  "phone": "(51) 99999-7777"
}
```

**Response (200):** Retorna o cliente atualizado.

### DELETE /clients/:id
Deleta um cliente.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "message": "Cliente deletado com sucesso."
}
```

---

## 📅 Reservas

### GET /reservations
Lista reservas com filtros opcionais.

**Headers:** `Authorization: Bearer <token>`

**Query Params:**
- `startDate` (ISO date)
- `endDate` (ISO date)
- `courtId` (uuid)
- `status` (CONFIRMED, PENDING, CANCELLED)

**Response (200):**
```json
[
  {
    "id": "uuid",
    "startTime": "2025-01-15T18:00:00.000Z",
    "endTime": "2025-01-15T19:00:00.000Z",
    "status": "CONFIRMED",
    "isRecurring": false,
    "court": {
      "id": "uuid",
      "name": "Quadra 1"
    },
    "client": {
      "id": "uuid",
      "fullName": "Carlos Eduardo"
    }
  }
]
```

### POST /reservations
Cria uma nova reserva (avulsa ou recorrente).

**Headers:** `Authorization: Bearer <token>`

**Request Body (Avulsa):**
```json
{
  "courtId": "uuid",
  "clientId": "uuid",
  "startTime": "2025-01-15T18:00:00.000Z",
  "endTime": "2025-01-15T19:00:00.000Z",
  "isRecurring": false
}
```

**Request Body (Recorrente):**
```json
{
  "courtId": "uuid",
  "clientId": "uuid",
  "startTime": "2025-01-15T18:00:00.000Z",
  "endTime": "2025-01-15T19:00:00.000Z",
  "isRecurring": true,
  "frequency": "WEEKLY",
  "dayOfWeek": 2,
  "endDate": "2025-06-15T00:00:00.000Z"
}
```

**Response (201):**
- Avulsa: Retorna a reserva criada
- Recorrente: 
```json
{
  "message": "15 reservas recorrentes criadas com sucesso!",
  "recurringGroupId": "uuid",
  "count": 15
}
```

### PUT /reservations/:id
Atualiza uma reserva.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "status": "CANCELLED"
}
```

**Response (200):** Retorna a reserva atualizada.

### DELETE /reservations/:id
Cancela uma reserva.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "message": "Reserva cancelada com sucesso."
}
```

---

## 📦 Produtos

### GET /products
Lista todos os produtos do complexo.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
[
  {
    "id": "uuid",
    "name": "Água Mineral 500ml",
    "description": "Água sem gás",
    "price": 3.50,
    "stock": 50,
    "unit": "UNIDADE",
    "expiryDate": null,
    "complexId": "uuid"
  }
]
```

### POST /products
Cria um novo produto.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "Água Mineral 500ml",
  "description": "Água sem gás",
  "price": 3.50,
  "stock": 50,
  "unit": "UNIDADE",
  "expiryDate": "2025-12-31T00:00:00.000Z"
}
```

**Response (201):** Retorna o produto criado.

### POST /products/:id/stock/add
Adiciona estoque ao produto.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "quantity": 20,
  "reason": "Compra de mercadoria"
}
```

**Response (200):** Retorna o produto atualizado.

### POST /products/:id/stock/remove
Remove estoque do produto.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "quantity": 5,
  "reason": "Ajuste de inventário"
}
```

**Response (200):** Retorna o produto atualizado.

---

## 🧾 Comandas

### GET /tabs
Lista comandas com filtros opcionais.

**Headers:** `Authorization: Bearer <token>`

**Query Params:**
- `status` (OPEN, PAID, CANCELLED)
- `clientId` (uuid)

**Response (200):**
```json
[
  {
    "id": "uuid",
    "total": 21.00,
    "status": "OPEN",
    "client": {
      "fullName": "Carlos Eduardo"
    },
    "reservation": {
      "court": {
        "name": "Quadra 1"
      }
    },
    "items": [...]
  }
]
```

### POST /tabs
Cria uma nova comanda.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "clientId": "uuid",
  "reservationId": "uuid"
}
```

**Response (201):** Retorna a comanda criada.

### POST /tabs/:id/items
Adiciona um item à comanda.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "productId": "uuid",
  "description": "Água Mineral 500ml",
  "quantity": 2,
  "unitPrice": 3.50
}
```

**Response (201):** Retorna o item criado.

### POST /tabs/:id/close
Fecha a comanda e atualiza o estoque.

**Headers:** `Authorization: Bearer <token>`

**Response (200):** Retorna a comanda fechada.

---

## 📊 Dashboard

### GET /dashboard/overview
Retorna estatísticas gerais do complexo.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "courts": {
    "total": 4,
    "available": 3,
    "occupied": 1
  },
  "clients": 25,
  "reservations": 12,
  "tabs": 5,
  "lowStockProducts": 2
}
```

### GET /dashboard/upcoming
Retorna próximos 10 horários marcados.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
[
  {
    "id": "uuid",
    "startTime": "2025-01-15T18:00:00.000Z",
    "endTime": "2025-01-15T19:00:00.000Z",
    "court": { "name": "Quadra 1" },
    "client": { "fullName": "Carlos Eduardo" }
  }
]
```

---

## ❌ Códigos de Erro

- `400` - Bad Request (dados inválidos)
- `401` - Unauthorized (não autenticado)
- `403` - Forbidden (sem permissão)
- `404` - Not Found (recurso não encontrado)
- `500` - Internal Server Error (erro no servidor)

## 📝 Notas

- Todas as datas devem estar no formato ISO 8601
- Valores monetários são em float (ex: 120.50)
- Status possíveis:
  - Courts: AVAILABLE, OCCUPIED, MAINTENANCE
  - Reservations: CONFIRMED, PENDING, CANCELLED
  - Tabs: OPEN, PAID, CANCELLED
