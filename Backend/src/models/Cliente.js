const database = require('../config/database');

class Cliente {
  static async getAll() {
    try {
      return await database.query(`
        SELECT c.*, 
               COUNT(r.id) as total_reservas,
               MAX(r.data) as ultima_reserva
        FROM clientes c
        LEFT JOIN reservas r ON c.id = r.cliente_id
        WHERE c.status = 'ativo'
        GROUP BY c.id
        ORDER BY c.nome
      `);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      return [];
    }
  }

  static async getById(id) {
    try {
      const result = await database.query(
        'SELECT * FROM clientes WHERE id = ?',
        [id]
      );
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error('Erro ao buscar cliente:', error);
      return null;
    }
  }

  static async create(clienteData) {
    try {
      const { nome, telefone, email, cpf, observacoes } = clienteData;
      
      // Verificar se telefone já existe
      const existente = await database.query(
        'SELECT id FROM clientes WHERE telefone = ? AND status = "ativo"',
        [telefone]
      );
      
      if (existente.length > 0) {
        throw new Error('Já existe um cliente com este telefone');
      }

      const result = await database.run(
        `INSERT INTO clientes (nome, telefone, email, cpf, observacoes) 
         VALUES (?, ?, ?, ?, ?)`,
        [nome, telefone, email || null, cpf || null, observacoes || null]
      );

      return await this.getById(result.id);
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      throw error;
    }
  }

  static async update(id, clienteData) {
    try {
      const { nome, telefone, email, cpf, observacoes } = clienteData;
      
      // Verificar se telefone já existe em outro cliente
      const existente = await database.query(
        'SELECT id FROM clientes WHERE telefone = ? AND id != ? AND status = "ativo"',
        [telefone, id]
      );
      
      if (existente.length > 0) {
        throw new Error('Já existe outro cliente com este telefone');
      }

      const result = await database.run(
        `UPDATE clientes 
         SET nome = ?, telefone = ?, email = ?, cpf = ?, observacoes = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [nome, telefone, email || null, cpf || null, observacoes || null, id]
      );

      return result.changes > 0;
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      // Soft delete - marca como inativo
      const result = await database.run(
        'UPDATE clientes SET status = "inativo", updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [id]
      );
      return result.changes > 0;
    } catch (error) {
      console.error('Erro ao deletar cliente:', error);
      return false;
    }
  }

  static async search(termo) {
    try {
      const searchTerm = `%${termo}%`;
      return await database.query(
        `SELECT * FROM clientes 
         WHERE (nome LIKE ? OR telefone LIKE ? OR email LIKE ?) 
         AND status = 'ativo'
         ORDER BY nome
         LIMIT 20`,
        [searchTerm, searchTerm, searchTerm]
      );
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      return [];
    }
  }

  static async getHistoricoReservas(clienteId) {
    try {
      return await database.query(
        `SELECT r.*, q.nome as quadra_nome, q.tipo as quadra_tipo
         FROM reservas r
         JOIN quadras q ON r.quadra_id = q.id
         WHERE r.cliente_id = ?
         ORDER BY r.data DESC, r.hora_inicio DESC
         LIMIT 50`,
        [clienteId]
      );
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
      return [];
    }
  }
}

module.exports = Cliente;
