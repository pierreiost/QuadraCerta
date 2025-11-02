# 🚀 Guia Rápido de Instalação - QuadraCerta

## Instalação Rápida (5 minutos)

### 1. Pré-requisitos
- Node.js 16+ instalado
- Terminal/CMD aberto

### 2. Instalação

```bash
# Navegue até a pasta do projeto
cd quadracerta

# Instale todas as dependências
npm run install-all
```

### 3. Configuração do Backend

```bash
# Entre na pasta do backend
cd backend

# Gere o cliente Prisma
npx prisma generate

# Crie o banco de dados e execute as migrações
npx prisma migrate dev --name init

# Volte para a raiz
cd ..
```

### 4. Inicie o Sistema

**Opção 1: Ambos simultaneamente**
```bash
npm run dev
```

**Opção 2: Separadamente**

Terminal 1 (Backend):
```bash
cd backend
npm run dev
```

Terminal 2 (Frontend):
```bash
cd frontend
npm start
```

### 5. Acesse o Sistema

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Primeiro Uso

1. **Cadastro**
   - Acesse http://localhost:3000/register
   - Preencha todos os campos obrigatórios
   - Clique em "Cadastrar"

2. **Login**
   - Use o email e senha cadastrados
   - Clique em "Entrar"

3. **Dashboard**
   - Você será redirecionado para o dashboard
   - Comece cadastrando sua primeira quadra!

## Troubleshooting

### Erro: "Cannot find module '@prisma/client'"
```bash
cd backend
npx prisma generate
```

### Erro: "Port 3000 already in use"
```bash
# Mude a porta do frontend editando package.json
# Ou mate o processo usando a porta 3000
```

### Erro: "Port 5000 already in use"
```bash
# Mude a porta no arquivo backend/.env
PORT=5001
```

### Erro: "prisma migrate"
```bash
cd backend
rm -rf prisma/migrations
rm dev.db
npx prisma migrate dev --name init
```

## Variáveis de Ambiente

### Backend (.env)
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="sua_chave_secreta_muito_segura"
PORT=5000
NODE_ENV=development
```

## Estrutura de Pastas

```
quadracerta/
├── backend/          # Servidor Node.js + Express
├── frontend/         # Aplicação React
├── package.json      # Scripts principais
└── README.md         # Documentação completa
```

## Próximos Passos

1. ✅ Cadastre quadras
2. ✅ Adicione clientes
3. ✅ Crie reservas
4. ✅ Gerencie produtos
5. ✅ Abra comandas

## Suporte

Para mais informações, consulte o README.md completo na raiz do projeto.
