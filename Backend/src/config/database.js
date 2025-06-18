const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
  constructor() {
    this.db = null;
  }

  async connect() {
    return new Promise((resolve, reject) => {
      const dbPath = path.join(__dirname, '../../database/quadras.db');
      
      // Criar diretório se não existir
      const fs = require('fs');
      const dbDir = path.dirname(dbPath);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }

      this.db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          console.error('Erro ao conectar com o banco:', err);
          reject(err);
        } else {
          console.log('✅ Conectado ao banco SQLite');
          // Aguardar criação das tabelas antes de resolver
          this.createTables()
            .then(() => resolve())
            .catch(reject);
        }
      });
    });
  }

  async createTables() {
    return new Promise((resolve, reject) => {
      // Habilitar foreign keys
      this.db.run('PRAGMA foreign_keys = ON');

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

      // Executar criação das tabelas sequencialmente
      let completed = 0;
      let hasError = false;

      tables.forEach((sql, index) => {
        this.db.run(sql, (err) => {
          if (err && !hasError) {
            hasError = true;
            console.error(`Erro ao criar tabela ${index + 1}:`, err);
            reject(err);
            return;
          }
          
          completed++;
          if (completed === tables.length && !hasError) {
            console.log('✅ Todas as tabelas criadas com sucesso');
            this.insertInitialData()
              .then(() => resolve())
              .catch(reject);
          }
        });
      });
    });
  }

  async insertInitialData() {
    return new Promise((resolve, reject) => {
      // Primeiro, verificar se já existem dados
      this.db.get('SELECT COUNT(*) as count FROM configuracoes', (err, row) => {
        if (err) {
          reject(err);
          return;
        }

        // Se já tem dados, não inserir novamente
        if (row.count > 0) {
          console.log('✅ Dados iniciais já existem');
          resolve();
          return;
        }

        // Inserir dados iniciais
        const configData = [
          ['admin_pin', '1234'],
          ['tentativas_login', '0'],
          ['bloqueio_ate', ''],
          ['timeout_minutos', '30']
        ];

        const quadrasData = [
          ['Futebol 1', 'futebol', '#28A745', 'disponivel'],
          ['Futebol 2', 'futebol', '#28A745', 'disponivel'],
          ['Beach Tênis', 'beach_tenis', '#FFC107', 'disponivel'],
          ['Society', 'society', '#007BFF', 'disponivel']
        ];

        let completed = 0;
        const totalInserts = configData.length + quadrasData.length;
        let hasError = false;

        // Inserir configurações
        const configSql = `INSERT INTO configuracoes (chave, valor) VALUES (?, ?)`;
        configData.forEach(([chave, valor]) => {
          this.db.run(configSql, [chave, valor], (err) => {
            if (err && !hasError) {
              hasError = true;
              reject(err);
              return;
            }
            completed++;
            if (completed === totalInserts && !hasError) {
              console.log('✅ Dados iniciais inseridos com sucesso');
              resolve();
            }
          });
        });

        // Inserir quadras
        const quadraSql = `INSERT INTO quadras (nome, tipo, cor, status) VALUES (?, ?, ?, ?)`;
        quadrasData.forEach(([nome, tipo, cor, status]) => {
          this.db.run(quadraSql, [nome, tipo, cor, status], (err) => {
            if (err && !hasError) {
              hasError = true;
              reject(err);
              return;
            }
            completed++;
            if (completed === totalInserts && !hasError) {
              console.log('✅ Dados iniciais inseridos com sucesso');
              resolve();
            }
          });
        });
      });
    });
  }

  query(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          console.error('Erro na query:', err);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          console.error('Erro no run:', err);
          reject(err);
        } else {
          resolve({ id: this.lastID, changes: this.changes });
        }
      });
    });
  }

  close() {
    if (this.db) {
      this.db.close((err) => {
        if (err) {
          console.error('Erro ao fechar banco:', err);
        } else {
          console.log('🔒 Conexão com banco fechada');
        }
      });
    }
  }
}

module.exports = new Database();