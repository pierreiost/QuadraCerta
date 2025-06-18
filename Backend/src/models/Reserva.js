// ===== backend/src/models/Reserva.js =====
const database = require('../config/database');

class Reserva {
  static async getAll(filtros = {}) {
    try {
      let sql = `
        SELECT r.*, 
               c.nome as cliente_nome, c.telefone as cliente_telefone,
               q.nome as quadra_nome, q.tipo as quadra_tipo, q.cor as quadra_cor
        FROM reservas r
        JOIN clientes c ON r.cliente_id = c.id
        JOIN quadras q ON r.quadra_id = q.id
        WHERE r.status != 'cancelada'
      `;
      
      const params = [];

      // Filtros opcionais
      if (filtros.quadra_id) {
        sql += ' AND r.quadra_id = ?';
        params.push(filtros.quadra_id);
      }

      if (filtros.data_inicio && filtros.data_fim) {
        sql += ' AND r.data BETWEEN ? AND ?';
        params.push(filtros.data_inicio, filtros.data_fim);
      } else if (filtros.data) {
        sql += ' AND r.data = ?';
        params.push(filtros.data);
      }

      if (filtros.status) {
        sql += ' AND r.status = ?';
        params.push(filtros.status);
      }

      sql += ' ORDER BY r.data DESC, r.hora_inicio ASC';

      return await database.query(sql, params);
    } catch (error) {
      console.error('Erro ao buscar reservas:', error);
      return [];
    }
  }

  static async getById(id) {
    try {
      const result = await database.query(
        `SELECT r.*, 
                c.nome as cliente_nome, c.telefone as cliente_telefone,
                q.nome as quadra_nome, q.tipo as quadra_tipo
         FROM reservas r
         JOIN clientes c ON r.cliente_id = c.id
         JOIN quadras q ON r.quadra_id = q.id
         WHERE r.id = ?`,
        [id]
      );
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error('Erro ao buscar reserva:', error);
      return null;
    }
  }

  static async create(reservaData) {
    try {
      const { 
        quadra_id, 
        cliente_id, 
        data, 
        hora_inicio, 
        hora_fim, 
        tipo = 'pontual',
        recorrencia = null,
        observacoes = null 
      } = reservaData;

      // Verificar conflitos de horário
      const conflito = await this.verificarConflito(quadra_id, data, hora_inicio, hora_fim);
      if (conflito) {
        throw new Error('Já existe uma reserva neste horário');
      }

      // Verificar se a quadra existe e está disponível
      const quadra = await database.query(
        'SELECT status FROM quadras WHERE id = ?',
        [quadra_id]
      );

      if (quadra.length === 0) {
        throw new Error('Quadra não encontrada');
      }

      if (quadra[0].status !== 'disponivel') {
        throw new Error('Quadra não está disponível para reservas');
      }

      const result = await database.run(
        `INSERT INTO reservas (quadra_id, cliente_id, data, hora_inicio, hora_fim, tipo, recorrencia, observacoes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [quadra_id, cliente_id, data, hora_inicio, hora_fim, tipo, recorrencia, observacoes]
      );

      return await this.getById(result.id);
    } catch (error) {
      console.error('Erro ao criar reserva:', error);
      throw error;
    }
  }

  static async update(id, reservaData) {
    try {
      const { 
        quadra_id, 
        cliente_id, 
        data, 
        hora_inicio, 
        hora_fim, 
        status,
        observacoes 
      } = reservaData;

      // Se está alterando horário, verificar conflitos
      if (quadra_id && data && hora_inicio && hora_fim) {
        const conflito = await this.verificarConflito(quadra_id, data, hora_inicio, hora_fim, id);
        if (conflito) {
          throw new Error('Já existe uma reserva neste horário');
        }
      }

      const result = await database.run(
        `UPDATE reservas 
         SET quadra_id = COALESCE(?, quadra_id),
             cliente_id = COALESCE(?, cliente_id),
             data = COALESCE(?, data),
             hora_inicio = COALESCE(?, hora_inicio),
             hora_fim = COALESCE(?, hora_fim),
             status = COALESCE(?, status),
             observacoes = COALESCE(?, observacoes),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [quadra_id, cliente_id, data, hora_inicio, hora_fim, status, observacoes, id]
      );

      return result.changes > 0;
    } catch (error) {
      console.error('Erro ao atualizar reserva:', error);
      throw error;
    }
  }

  static async cancelar(id, motivo = null) {
    try {
      const observacoes = motivo ? `Cancelada: ${motivo}` : 'Cancelada';
      
      const result = await database.run(
        'UPDATE reservas SET status = "cancelada", observacoes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [observacoes, id]
      );

      return result.changes > 0;
    } catch (error) {
      console.error('Erro ao cancelar reserva:', error);
      return false;
    }
  }

  static async verificarConflito(quadra_id, data, hora_inicio, hora_fim, excluir_id = null) {
    try {
      let sql = `
        SELECT id FROM reservas 
        WHERE quadra_id = ? 
        AND data = ? 
        AND status = 'confirmada'
        AND (
          (hora_inicio <= ? AND hora_fim > ?) OR
          (hora_inicio < ? AND hora_fim >= ?) OR
          (hora_inicio >= ? AND hora_fim <= ?)
        )
      `;
      
      const params = [
        quadra_id, data,
        hora_inicio, hora_inicio,
        hora_fim, hora_fim,
        hora_inicio, hora_fim
      ];

      if (excluir_id) {
        sql += ' AND id != ?';
        params.push(excluir_id);
      }

      const conflitos = await database.query(sql, params);
      return conflitos.length > 0;
    } catch (error) {
      console.error('Erro ao verificar conflito:', error);
      return true; // Em caso de erro, assumir que há conflito
    }
  }

  static async getReservasPorQuadra(quadra_id, data_inicio, data_fim) {
    try {
      return await database.query(
        `SELECT r.*, 
                c.nome as cliente_nome, c.telefone as cliente_telefone
         FROM reservas r
         JOIN clientes c ON r.cliente_id = c.id
         WHERE r.quadra_id = ? 
         AND r.data BETWEEN ? AND ?
         AND r.status = 'confirmada'
         ORDER BY r.data, r.hora_inicio`,
        [quadra_id, data_inicio, data_fim]
      );
    } catch (error) {
      console.error('Erro ao buscar reservas da quadra:', error);
      return [];
    }
  }

  static async getReservasHoje() {
    try {
      const hoje = new Date().toISOString().split('T')[0];
      return await this.getAll({ data: hoje });
    } catch (error) {
      console.error('Erro ao buscar reservas de hoje:', error);
      return [];
    }
  }

  static async getProximasReservas(limite = 10) {
    try {
      const agora = new Date();
      const dataAtual = agora.toISOString().split('T')[0];
      const horaAtual = agora.toTimeString().split(' ')[0].substring(0, 5);

      return await database.query(
        `SELECT r.*, 
                c.nome as cliente_nome, c.telefone as cliente_telefone,
                q.nome as quadra_nome, q.tipo as quadra_tipo
         FROM reservas r
         JOIN clientes c ON r.cliente_id = c.id
         JOIN quadras q ON r.quadra_id = q.id
         WHERE r.status = 'confirmada'
         AND (r.data > ? OR (r.data = ? AND r.hora_inicio >= ?))
         ORDER BY r.data, r.hora_inicio
         LIMIT ?`,
        [dataAtual, dataAtual, horaAtual, limite]
      );
    } catch (error) {
      console.error('Erro ao buscar próximas reservas:', error);
      return [];
    }
  }
}

module.exports = Reserva;