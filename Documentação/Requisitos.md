# Requisitos do Sistema para o Complexo Gonzaga

## Requisitos Funcionais

### RF001 - Autenticação de Usuário
*Descrição:* O sistema deve permitir que o usuário responsável faça login utilizando credenciais estáticas predefinidas.

*Critérios de Aceitação:*
- O sistema deve apresentar uma tela de login com campos para usuário e senha
- O sistema deve validar as credenciais inseridas contra valores estáticos configurados
- Em caso de credenciais corretas, o usuário deve ser redirecionado para a tela principal
- Em caso de credenciais incorretas, deve ser apresentada mensagem de erro
- O sistema deve manter a sessão do usuário autenticado

### RF002 - Controle de Sessão
*Descrição:* O sistema deve gerenciar a sessão do usuário autenticado, permitindo logout.

*Critérios de Aceitação:*
- O sistema deve fornecer opção de logout manual
- O sistema não terá troca de senha, sendo credenciais estáticas

### RF003 - Visualização de Quadras Disponíveis
*Descrição:* O sistema deve exibir as 4 quadras disponíveis (3 de futebol e 1 de beach tennis) com suas respectivas informações.

*Critérios de Aceitação:*
- O sistema deve listar todas as quadras com identificação clara
- O sistema deve distinguir visualmente quadras de futebol e beach tennis
- O sistema deve apresentar status atual de cada quadra (disponível/ocupada)

### RF004 - Agendamento de Horários Avulsos
*Descrição:* O sistema deve permitir o agendamento de horários específicos para uso pontual das quadras.

*Critérios de Aceitação:*
- O sistema deve apresentar calendário ou grade horária para seleção
- O sistema deve exibir apenas horários disponíveis para agendamento
- O sistema deve permitir seleção de data, horário e quadra desejada
- O sistema deve confirmar o agendamento e atualizar a disponibilidade
- O sistema deve impedir agendamentos em horários já ocupados

### RF005 - Agendamento de Aluguéis Permanentes
*Descrição:* O sistema deve permitir o cadastro de aluguéis permanentes (mensalistas) com recorrência de horários.

*Critérios de Aceitação:*
- O sistema deve permitir definir horários fixos com recorrência
- O sistema deve permitir especificar período de vigência do aluguel permanente
- O sistema deve bloquear automaticamente os horários recorrentes
- O sistema deve identificar visualmente agendamentos permanentes

### RF006 - Edição de Agendamentos
*Descrição:* O sistema deve permitir modificar agendamentos existentes.

*Critérios de Aceitação:*
- O sistema deve permitir alterar data, horário ou quadra de agendamentos avulsos
- O sistema deve permitir modificar configurações de aluguéis permanentes
- O sistema deve validar disponibilidade antes de confirmar alterações
- O sistema deve manter histórico de alterações realizadas

### RF007 - Cancelamento de Agendamentos
*Descrição:* O sistema deve permitir cancelar agendamentos existentes.

*Critérios de Aceitação:*
- O sistema deve permitir cancelamento de agendamentos avulsos
- O sistema deve permitir cancelamento de aluguéis permanentes
- O sistema deve liberar horários cancelados para nova reserva
- O sistema deve solicitar confirmação antes de cancelar

### RF008 - Sistema de Comanda Temporária
*Descrição:* O sistema deve permitir controlar o consumo momentâneo durante o uso das quadras.

*Critérios de Aceitação:*
- O sistema deve apresentar interface para registro de consumo
- O sistema deve permitir adicionar itens de diferentes categorias (bebidas, alimentos, etc.)
- O sistema deve calcular total do consumo em tempo real
- O sistema deve permitir edição de quantidades e remoção de itens
- O sistema deve associar a comanda ao período de uso da quadra

### RF009 - Gestão de Produtos da Comanda
*Descrição:* O sistema deve permitir gerenciar os produtos disponíveis para a comanda temporária.

*Critérios de Aceitação:*
- O sistema irá ter inicialmente uma lista estática de itens.

### RF010 - Não Persistência de Dados da Comanda
*Descrição:* O sistema deve garantir que os dados da comanda temporária não sejam salvos permanentemente.

*Critérios de Aceitação:*
- O sistema deve armazenar dados da comanda apenas na memória durante a sessão
- O sistema deve limpar automaticamente dados da comanda ao finalizar o uso
- O sistema não deve manter histórico de consumo individual dos usuários
- O sistema deve permitir apenas visualização de totais durante o período ativo

### RF011 - Finalização de Comanda
*Descrição:* O sistema deve permitir finalizar a comanda e calcular o valor total do consumo.

*Critérios de Aceitação:*
- O sistema deve apresentar resumo completo da comanda
- O sistema deve calcular valor total incluindo possíveis taxas
- O sistema deve permitir impressão ou exportação do resumo
- O sistema deve limpar dados da comanda após finalização

## Requisitos Não Funcionais

### RNF001 - Usabilidade
*Descrição:* Qualquer pessoa deve conseguir usar o sistema em no máximo 15 minutos de treinamento.

*Critérios de Aceitação:*
- Uma pessoa sem conhecimento técnico deve conseguir fazer um agendamento em até 3 cliques
- Todas as telas devem ter no máximo 10 botões visíveis
- Mensagens de erro devem usar linguagem simples, sem termos técnicos
- Fontes devem ter tamanho mínimo de 14px para facilitar leitura

### RNF002 - Responsividade
*Descrição:* O sistema deve funcionar perfeitamente em telas de 15 polegadas (notebooks) e tablets de 10 polegadas.

*Critérios de Aceitação:*
- Funcionar perfeitamente em notebooks com tela de 15 polegadas (1366x768px)
- Funcionar perfeitamente em tablets de 10 polegadas (1024x768px)
- Botões devem ter tamanho mínimo de 44px de altura para facilitar o toque
- Textos devem ser legíveis sem precisar dar zoom na tela

### RNF003 - Performance
*Descrição:* O sistema deve responder em no máximo 3 segundos para qualquer requisição.

*Critérios de Aceitação:*
- Qualquer tela do sistema deve carregar completamente em até 3 segundos (exceto login)
- Login do usuário deve ser validado ou não em até 5 segundos
- Salvamento de agendamentos deve ser confirmado em até 3 segundos
- Adição de itens na comanda deve aparecer na tela em até 2 segundos

### RNF004 - Disponibilidade
*Descrição:* O sistema deverá funcionar sempre.

*Critérios de Aceitação:*
- Sistema deve estar online 100% do tempo durante horário de funcionamento
- Paradas programadas apenas fora do horário comercial (00h às 06h)

### RNF005 - Segurança
*Descrição:* O sistema deve manter o usuário logado por no máximo 2 horas de inatividade e ter senha com 8 caracteres mínimos.

*Critérios de Aceitação:*
- Usuário será da escolha do contratante
- Senha estatitca deve ter no mínimo 8 caracteres, com uma segurança básica

### RNF006 - Compatibilidade
*Descrição:* O sistema deve funcionar nos 4 principais navegadores: Chrome, Firefox, Safari e Edge.

*Critérios de Aceitação:*
- Funcionar perfeitamente em todos os navegadores compativeis com react native.
- Todas as funcionalidades devem operar identicamente em todos os navegadores

### RNF007 - Manutenibilidade
*Descrição:* O sistema deve ser facilmente mantido e atualizado.

*Critérios de Aceitação:*
- Código deve seguir padrões de desenvolvimento estabelecidos
- Sistema deve ter documentação técnica adequada
- Arquitetura deve permitir adição de novas funcionalidades

### RNF008 - Escalabilidade
*Descrição:* O sistema deve suportar até 20 agendamentos simultâneos e 100 agendamentos por dia.

*Critérios de Aceitação:*
- Suportar até 20 pessoas fazendo agendamentos ao mesmo tempo
- Processar até 100 agendamentos por dia sem lentidão
- Permitir cadastro de até 10 quadras no futuro (atualmente são 4)

### RNF009 - Confiabilidade
*Descrição:* Todos os agendamentos devem ser salvos corretamente.

*Critérios de Aceitação:*
- 100% dos agendamentos realizados devem ser salvos corretamente
- Se houver erro, o sistema deve mostrar mensagem clara do que aconteceu

### RNF010 - Privacidade
*Descrição:* Os dados da comanda devem ser apagados automaticamente após o fim da sessão.

*Critérios de Aceitação:*
- Dados de consumo (comanda) devem ser excluídos automaticamente após fim da sessão
- Sistema não deve guardar histórico de produtos consumidos por clientes
- Nenhum dado pessoal deve ser coletado ou armazenado


