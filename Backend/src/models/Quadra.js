const database = require('../config/database');

class Quadra {
  static async getAll() {
    try {
      return await database.query(`
        SELECT q.*, 
               COUNT(r.id) as reservas_hoje
        FROM quadras q
        LEFT JOIN reservas r ON q.id = r.quadra_id 
                            AND r.data = date('now') 
                            AND r.status = 'confirmada'
        GROUP BY q.id
        ORDER BY q.nome
      `);
    } catch (error) {
      console.error('Erro ao buscar quadras:', error);
      return [];
    }
  }

  static async getById(id) {
    try {
      const result = await database.query(
        'SELECT * FROM quadras WHERE id = ?',
        [id]
      );
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error('Erro ao buscar quadra:', error);
      return null;
    }
  }

  static async updateStatus(id, status) {
    try {
      const result = await database.run(
        'UPDATE quadras SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [status, id]
      );
      return result.changes > 0;
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      return false;
    }
  }

  static async getStatusAtual() {
    try {
      const quadras = await this.getAll();
      return quadras.map(quadra => ({
        id: quadra.id,
        nome: quadra.nome,
        tipo: quadra.tipo,
        status: quadra.status,
        cor: quadra.cor,
        reservas_hoje: quadra.reservas_hoje
      }));
    } catch (error) {
      console.error('Erro ao obter status:', error);
      return [];
    }
  }
}

module.exports = Quadra;