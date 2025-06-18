const database = require('../config/database');

class Auth {
  static async validatePin(pin) {
    try {
      const result = await database.query(
        'SELECT valor FROM configuracoes WHERE chave = ?',
        ['admin_pin']
      );
      
      if (result.length === 0) return false;
      
      return result[0].valor === pin;
    } catch (error) {
      console.error('Erro ao validar PIN:', error);
      return false;
    }
  }

  static async getTentativasLogin() {
    try {
      const result = await database.query(
        'SELECT valor FROM configuracoes WHERE chave = ?',
        ['tentativas_login']
      );
      return result.length > 0 ? parseInt(result[0].valor) : 0;
    } catch (error) {
      console.error('Erro ao obter tentativas:', error);
      return 0;
    }
  }

  static async incrementarTentativas() {
    try {
      const tentativas = await this.getTentativasLogin();
      await database.run(
        'UPDATE configuracoes SET valor = ? WHERE chave = ?',
        [String(tentativas + 1), 'tentativas_login']
      );
      return tentativas + 1;
    } catch (error) {
      console.error('Erro ao incrementar tentativas:', error);
      return 0;
    }
  }

  static async resetarTentativas() {
    try {
      await database.run(
        'UPDATE configuracoes SET valor = ? WHERE chave = ?',
        ['0', 'tentativas_login']
      );
    } catch (error) {
      console.error('Erro ao resetar tentativas:', error);
    }
  }

  static async bloquearLogin(minutos = 15) {
    try {
      const bloqueioAte = new Date(Date.now() + minutos * 60000).toISOString();
      await database.run(
        'UPDATE configuracoes SET valor = ? WHERE chave = ?',
        [bloqueioAte, 'bloqueio_ate']
      );
    } catch (error) {
      console.error('Erro ao bloquear login:', error);
    }
  }

  static async verificarBloqueio() {
    try {
      const result = await database.query(
        'SELECT valor FROM configuracoes WHERE chave = ?',
        ['bloqueio_ate']
      );
      
      if (result.length === 0 || !result[0].valor) return false;
      
      const bloqueioAte = new Date(result[0].valor);
      const agora = new Date();
      
      return agora < bloqueioAte;
    } catch (error) {
      console.error('Erro ao verificar bloqueio:', error);
      return false;
    }
  }

  static async logarAcesso(acao, detalhes = '', ip = '') {
    try {
      await database.run(
        'INSERT INTO logs_acesso (acao, detalhes, ip_address) VALUES (?, ?, ?)',
        [acao, detalhes, ip]
      );
    } catch (error) {
      console.error('Erro ao logar acesso:', error);
    }
  }
}

module.exports = Auth;