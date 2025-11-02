# 🏐 QuadraCerta - Sistema de Gerenciamento de Complexos Esportivos

![Status](https://img.shields.io/badge/status-active-success)
![License](https://img.shields.io/badge/license-MIT-blue)

Sistema robusto e intuitivo desenvolvido para otimizar a administração de complexos esportivos, desde o agendamento de quadras até o gerenciamento completo de clientes, estoque e comandas.

## 📋 Índice

- [Características](#-características)
- [Tecnologias](#-tecnologias)
- [Instalação](#-instalação)
- [Uso](#-uso)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [API Endpoints](#-api-endpoints)
- [Contribuindo](#-contribuindo)

## ✨ Características

### Principais Funcionalidades

- **Gerenciamento de Usuários e Acessos**
  - Super Admin (Desenvolvedores)
  - Admin (Donos das Quadras)
  - Semi Admin (Funcionários)

- **Sistema de Agendamento Completo**
  - Calendário visual (diário, semanal, mensal)
  - Reservas avulsas e recorrentes
  - Gerenciamento de conflitos automático
  - Filtros por quadra, data e cliente

- **Gerenciamento de Quadras**
  - Cadastro detalhado de quadras
  - Controle de disponibilidade
  - Status (Disponível, Ocupada, Manutenção)

- **Gerenciamento de Clientes**
  - Cadastro completo
  - Histórico de reservas e comandas

- **Gerenciamento de Estoque**
  - Controle de produtos
  - Movimentação de entrada/saída
  - Alertas de estoque baixo

- **Gerenciamento de Comandas**
  - Criação por cliente ou reserva
  - Adição de produtos e serviços
  - Fechamento com atualização automática de estoque

## 🚀 Tecnologias

### Backend
- Node.js
- Express.js
- Prisma ORM
- SQLite (desenvolvimento) / PostgreSQL (produção)
- JWT Authentication
- bcryptjs

### Frontend
- React 18
- React Router v6
- Axios
- date-fns
- Lucide React (ícones)

## 📦 Instalação

### Pré-requisitos

- Node.js 16+ 
- npm ou yarn

### Passo a Passo

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/quadracerta.git
cd quadracerta
```

2. **Instale as dependências**
```bash
npm run install-all
```

Ou instale manualmente:

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

3. **Configure o ambiente**

Crie um arquivo `.env` no diretório `backend/`:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="sua_chave_secreta_aqui"
PORT=5000
NODE_ENV=development
```

4. **Configure o banco de dados**

```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
```

5. **Inicie os servidores**

Em terminais separados:

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

Ou use o comando integrado:

```bash
npm run dev
```

## 🎯 Uso

### Acesso ao Sistema

1. Acesse `http://localhost:3000`
2. Crie uma conta na tela de registro
3. Faça login com suas credenciais

### Criando sua Primeira Quadra

1. No dashboard, clique em "Nova Quadra"
2. Preencha as informações:
   - Nome da quadra
   - Tipo de esporte
   - Capacidade de jogadores
   - Valor por hora
3. Salve a quadra

### Criando uma Reserva

1. Clique em "Nova Reserva"
2. Selecione a quadra
3. Escolha ou cadastre um cliente
4. Defina data e horário
5. Para reservas recorrentes, marque a opção e configure a frequência

### Gerenciando Comandas

1. Acesse "Comandas" no menu
2. Crie uma nova comanda associada a um cliente
3. Adicione produtos do estoque
4. Feche a comanda para finalizar o pagamento

## 📁 Estrutura do Projeto

```
quadracerta/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma      # Schema do banco de dados
│   ├── routes/                # Rotas da API
│   │   ├── auth.js
│   │   ├── courts.js
│   │   ├── clients.js
│   │   ├── reservations.js
│   │   ├── products.js
│   │   ├── tabs.js
│   │   └── dashboard.js
│   ├── middleware/
│   │   └── auth.js            # Middleware de autenticação
│   ├── server.js              # Servidor principal
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/        # Componentes reutilizáveis
│   │   │   └── Header.js
│   │   ├── contexts/          # Contexts do React
│   │   │   └── AuthContext.js
│   │   ├── pages/             # Páginas da aplicação
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   └── Dashboard.js
│   │   ├── services/          # Serviços de API
│   │   │   └── api.js
│   │   ├── styles/            # Arquivos CSS
│   │   │   └── App.css
│   │   ├── App.js             # Componente principal
│   │   └── index.js
│   └── package.json
│
└── README.md
```

## 🔌 API Endpoints

### Autenticação
- `POST /api/auth/register` - Registrar novo complexo
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Obter dados do usuário

### Quadras
- `GET /api/courts` - Listar quadras
- `POST /api/courts` - Criar quadra
- `GET /api/courts/:id` - Buscar quadra
- `PUT /api/courts/:id` - Atualizar quadra
- `DELETE /api/courts/:id` - Deletar quadra

### Clientes
- `GET /api/clients` - Listar clientes
- `POST /api/clients` - Criar cliente
- `GET /api/clients/:id` - Buscar cliente com histórico
- `PUT /api/clients/:id` - Atualizar cliente
- `DELETE /api/clients/:id` - Deletar cliente

### Reservas
- `GET /api/reservations` - Listar reservas (com filtros)
- `POST /api/reservations` - Criar reserva (avulsa ou recorrente)
- `GET /api/reservations/:id` - Buscar reserva
- `PUT /api/reservations/:id` - Atualizar reserva
- `DELETE /api/reservations/:id` - Cancelar reserva

### Produtos
- `GET /api/products` - Listar produtos
- `POST /api/products` - Criar produto
- `GET /api/products/:id` - Buscar produto
- `PUT /api/products/:id` - Atualizar produto
- `POST /api/products/:id/stock/add` - Adicionar estoque
- `POST /api/products/:id/stock/remove` - Remover estoque
- `DELETE /api/products/:id` - Deletar produto

### Comandas
- `GET /api/tabs` - Listar comandas
- `POST /api/tabs` - Criar comanda
- `GET /api/tabs/:id` - Buscar comanda
- `POST /api/tabs/:id/items` - Adicionar item
- `DELETE /api/tabs/:id/items/:itemId` - Remover item
- `POST /api/tabs/:id/close` - Fechar comanda
- `DELETE /api/tabs/:id` - Cancelar comanda

### Dashboard
- `GET /api/dashboard/overview` - Estatísticas gerais
- `GET /api/dashboard/upcoming` - Próximos horários
- `GET /api/dashboard/revenue` - Relatório de receitas
- `GET /api/dashboard/occupancy` - Relatório de ocupação

## 🛠️ Scripts Disponíveis

### Backend
```bash
npm run dev      # Inicia servidor em modo desenvolvimento
npm start        # Inicia servidor em produção
```

### Frontend
```bash
npm start        # Inicia aplicação React
npm run build    # Build para produção
```

### Raiz do Projeto
```bash
npm run install-all  # Instala todas as dependências
npm run dev          # Inicia backend e frontend simultaneamente
```

## 🔐 Autenticação

O sistema utiliza JWT (JSON Web Tokens) para autenticação. O token é armazenado no localStorage e incluído automaticamente em todas as requisições através do interceptor do Axios.

## 📊 Modelo de Dados

### User
- id, firstName, lastName, email, password
- cpf, cnpj, phone, role
- complexId (FK)

### Complex
- id, name, cnpj

### Court
- id, name, sportType, capacity
- pricePerHour, description, status
- complexId (FK)

### Client
- id, fullName, phone, email, cpf
- complexId (FK)

### Reservation
- id, courtId (FK), clientId (FK)
- startTime, endTime, status
- isRecurring, recurringGroupId (FK)

### RecurringGroup
- id, frequency, dayOfWeek
- startDate, endDate

### Product
- id, name, description, price
- stock, unit, expiryDate
- complexId (FK)

### Tab (Comanda)
- id, clientId (FK), reservationId (FK)
- total, status, paidAt

### TabItem
- id, tabId (FK), productId (FK)
- description, quantity, unitPrice, total

## 🚀 Deploy

### Backend

1. Configure as variáveis de ambiente
2. Atualize DATABASE_URL para PostgreSQL (produção)
3. Execute as migrações: `npx prisma migrate deploy`
4. Inicie o servidor: `npm start`

### Frontend

1. Configure a URL da API em `src/services/api.js`
2. Faça o build: `npm run build`
3. Sirva os arquivos estáticos da pasta `build/`

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👥 Autores

- Desenvolvedor Principal - QuadraCerta Team

## 📧 Contato

Para suporte ou questões, entre em contato através de: suporte@quadracerta.com

---

⭐ Se este projeto foi útil para você, considere dar uma estrela!
