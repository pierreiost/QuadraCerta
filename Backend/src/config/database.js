const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
  constructor() {
    this.db = null;
  }

  async connect() {
    return new Promise((resolve, reject) => {
      const dbPath = path.join(__dirname, '../../database/quadras.db');
      this.db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          console.error('Erro ao conectar com o banco:', err);
          reject(err);
        } else {
          console.log('✅ Conectado ao banco SQLite');
          this.createTables();
          resolve();
        }
      });
    });
  }

  createTables() {
    const tables = [
      // Tabela de configurações (incluindo PIN)
      `CREATE TABLE IF NOT EXISTS configuracoes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        chave TEXT UNIQUE NOT NULL,
        valor TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Tabela de quadras
      `CREATE TABLE IF NOT EXISTS quadras (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        tipo TEXT NOT NULL,
        status TEXT DEFAULT 'disponivel',
        cor TEXT NOT NULL,
        horario_abertura TEXT DEFAULT '06:00',
        horario_fechamento TEXT DEFAULT '23:00',
        intervalo_reservas INTEGER DEFAULT 15,
        observacoes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Tabela de clientes
      `CREATE TABLE IF NOT EXISTS clientes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        telefone TEXT NOT NULL,
        email TEXT,
        cpf TEXT,
        status TEXT DEFAULT 'ativo',
        observacoes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Tabela de reservas
      `CREATE TABLE IF NOT EXISTS reservas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        quadra_id INTEGER NOT NULL,
        cliente_id INTEGER NOT NULL,
        data DATE NOT NULL,
        hora_inicio TIME NOT NULL,
        hora_fim TIME NOT NULL,
        status TEXT DEFAULT 'confirmada',
        tipo TEXT DEFAULT 'pontual',
        recorrencia TEXT,
        observacoes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (quadra_id) REFERENCES quadras (id),
        FOREIGN KEY (cliente_id) REFERENCES clientes (id)
      )`,

      // Tabela de logs de acesso
      `CREATE TABLE IF NOT EXISTS logs_acesso (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        acao TEXT NOT NULL,
        detalhes TEXT,
        ip_address TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`
    ];

    tables.forEach(sql => {
      this.db.run(sql, (err) => {
        if (err) console.error('Erro ao criar tabela:', err);
      });
    });

    // Inserir dados iniciais
    this.insertInitialData();
  }

  insertInitialData() {
    // PIN padrão: 1234
    const initialData = [
      // Configurações iniciais
      { chave: 'admin_pin', valor: '1234' },
      { chave: 'tentativas_login', valor: '0' },
      { chave: 'bloqueio_ate', valor: '' },
      { chave: 'timeout_minutos', valor: '30' },

      // Quadras iniciais
      { 
        nome: 'Futebol 1', 
        tipo: 'futebol', 
        cor: '#28A745',
        status: 'disponivel'
      },
      { 
        nome: 'Futebol 2', 
        tipo: 'futebol', 
        cor: '#28A745',
        status: 'disponivel'
      },
      { 
        nome: 'Beach Tênis', 
        tipo: 'beach_tenis', 
        cor: '#FFC107',
        status: 'disponivel'
      },
      { 
        nome: 'Society', 
        tipo: 'society', 
        cor: '#007BFF',
        status: 'disponivel'
      }
    ];

    // Inserir configurações
    const configSql = `INSERT OR IGNORE INTO configuracoes (chave, valor) VALUES (?, ?)`;
    initialData.slice(0, 4).forEach(config => {
      this.db.run(configSql, [config.chave, config.valor]);
    });

    // Inserir quadras
    const quadraSql = `INSERT OR IGNORE INTO quadras (nome, tipo, cor, status) VALUES (?, ?, ?, ?)`;
    initialData.slice(4).forEach(quadra => {
      this.db.run(quadraSql, [quadra.nome, quadra.tipo, quadra.cor, quadra.status]);
    });
  }

  query(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, changes: this.changes });
      });
    });
  }

  close() {
    if (this.db) {
      this.db.close();
    }
  }
}

module.exports = new Database();