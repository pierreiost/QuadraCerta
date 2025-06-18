# Sistema de Gestão de Quadras Esportivas Complexo Gonzaga
## Documentação do Trabalho de Conclusão de Curso

---

## 1. Introdução

O presente trabalho tem como proposta o desenvolvimento de um sistema para gestão de quadras esportivas, visando otimizar o processo de agendamento e controle de uso de espaços destinados à prática esportiva e recreativa. O sistema foi concebido para atender às necessidades específicas de um estabelecimento que oferece duas modalidades esportivas, proporcionando uma solução simples e eficiente para a administração desses espaços.

A crescente desse ambiente e a necessidade de melhor organização dos recursos disponíveis motivaram o desenvolvimento desta aplicação, que busca simplificar tanto a gestão administrativa quanto a experiência do usuário final. O sistema contempla desde o controle básico de acesso até funcionalidades mais elaboradas de gerenciamento de consumo durante o uso das instalações.

## 2. Objetivos

### 2.1 Objetivo Geral

Desenvolver um sistema web para gestão eficiente de quadras esportivas, proporcionando controle completo sobre agendamentos, autenticação de usuários e gerenciamento de consumo temporário durante o uso das instalações.

### 2.2 Objetivos Específicos

- Implementar um sistema de autenticação seguro para controle de acesso ao sistema, sendo exclusivo de um usuário administrador
- Criar uma interface intuitiva para agendamento de horários nas quadras disponíveis
- Desenvolver funcionalidades que suportem tanto agendamentos pontuais quanto contratos permanentes
- Estabelecer um sistema de comanda temporária para controle de consumo durante o uso das quadras
- Garantir que os dados de consumo temporário não sejam persistidos no sistema, mantendo a privacidade dos usuários
- Proporcionar uma experiência de usuário fluida e responsiva

## 3. Justificativa

A gestão manual de quadras esportivas apresenta diversos desafios operacionais que impactam tanto a eficiência administrativa quanto a satisfação dos usuários. Problemas como conflitos de horários, dificuldade no controle de consumo e falta de organização nos agendamentos são recorrentes em estabelecimentos que ainda dependem de métodos tradicionais de gestão.

A digitalização desses processos traz benefícios significativos, incluindo a redução de erros humanos, maior transparência nos agendamentos e melhor controle financeiro. Além disso, a implementação de um sistema informatizado permite a coleta de dados relevantes para tomadas de decisão mais assertivas, contribuindo para o crescimento sustentável do negócio.

O diferencial proposto neste projeto reside na combinação de funcionalidades essenciais com uma abordagem focada na privacidade do usuário, especialmente no que se refere ao controle de consumo temporário. Esta característica atende às demandas contemporâneas de proteção de dados pessoais, ao mesmo tempo que oferece funcionalidade prática para o estabelecimento.

## 4. Tecnologias Utilizadas

O desenvolvimento do sistema baseia-se em tecnologias modernas e consolidadas no mercado, garantindo robustez, escalabilidade e facilidade de manutenção. A arquitetura escolhida prioriza a separação clara entre interface e lógica de negócio, proporcionando flexibilidade para futuras expansões.

*Frontend:* React Native, Tailwind* A interface do usuário será desenvolvido garantindo compatibilidade com diferentes navegadores e dispositivos. A abordagem responsiva assegura uma experiência consistente tanto em desktops quanto em dispositivos móveis, aspecto fundamental considerando a natureza dinâmica do ambiente esportivo.

*Backend: NodeJS e Express* A lógica de servidor será implementada com foco na segurança e performance, incorporando práticas recomendadas para autenticação e autorização. A arquitetura modular facilita a manutenção e permite a adição de novas funcionalidades conforme necessário.

*Banco de Dados:* O sistema de persistência foi projetado para armazenar eficientemente os dados de agendamento e configurações do sistema, mantendo a integridade referencial e otimizando consultas frequentes. Vale ressaltar que os dados de consumo temporário não são persistidos, conforme especificação do projeto.

## 5. Funcionalidades Detalhadas

### 5.1 Sistema de Autenticação

O acesso ao sistema é controlado através de uma tela de login que utiliza credenciais estáticas predefinidas. Esta abordagem foi escolhida considerando que o sistema será operado por um número limitado de usuários autorizados, simplificando a gestão de acessos sem comprometer a segurança.

A implementação inclui validação de credenciais no lado servidor, proteção contra tentativas de acesso não autorizado e controle de sessão para manter o usuário logado durante o período de uso ativo. O sistema também incorpora mecanismos de logout automático por inatividade, garantindo a segurança mesmo em caso de esquecimento por parte do operador.

### 5.2 Gestão de Agendamentos

O núcleo do sistema reside na funcionalidade de agendamento, projetada para gerenciar quatro quadras distintas: três destinadas ao futebol e uma ao beach tennis. Esta diversidade de modalidades exigiu o desenvolvimento de uma interface flexível que se adapta às características específicas de cada esporte.

*Agendamentos Avulsos:* Permite a marcação de horários específicos para uso pontual das quadras. O sistema apresenta uma visualização clara da disponibilidade, facilitando a identificação de horários livres e evitando conflitos. A interface inclui filtros por data, horário e tipo de quadra, agilizando o processo de busca por horários adequados.

*Aluguéis Permanentes:* Contempla a gestão de contratos mensais ou outros períodos fixos, comumente utilizados por grupos regulares ou escolinhas esportivas. Esta funcionalidade permite o bloqueio recorrente de horários específicos, garantindo disponibilidade para clientes com demanda constante.

O sistema de agendamento incorpora validações automáticas para prevenir sobreposições, além de oferecer funcionalidades de edição e cancelamento de reservas, proporcionando flexibilidade operacional necessária em ambientes dinâmicos.

### 5.3 Sistema de Comanda Temporária

Uma das funcionalidades mais inovadoras do sistema é o controle de consumo temporário durante o uso das quadras. Esta ferramenta permite o registro de itens consumidos pelos usuários, como bebidas e alimentos, sem que essas informações sejam permanentemente armazenadas no banco de dados.

A comanda temporária opera exclusivamente na memória da aplicação durante a sessão de uso, sendo automaticamente limpa ao final de cada período de locação. Esta abordagem atende simultaneamente às necessidades operacionais do estabelecimento e aos requisitos de privacidade dos usuários.

A interface da comanda apresenta categorias organizadas de produtos, facilitando a adição rápida de itens. O sistema calcula automaticamente os totais e permite ajustes conforme necessário, proporcionando controle preciso sobre o consumo durante o período de uso da quadra.

### 5.4 Interface e Experiência do Usuário

O design da interface priorizou a simplicidade e eficiência, considerando que o sistema será utilizado em ambiente dinâmico onde a agilidade é fundamental. A navegação foi estruturada de forma intuitiva, minimizando a curva de aprendizado.

A responsividade da interface garante funcionalidade adequada em diferentes dispositivos, permitindo operação tanto em computadores de mesa quanto em tablets, oferecendo flexibilidade operacional importante para o contexto de uso.

## 6. Considerações Finais

O desenvolvimento deste sistema representa uma contribuição significativa para a modernização da gestão de espaços esportivos, combinando funcionalidades essenciais com inovações importantes na área de privacidade e controle de dados. A abordagem adotada para o sistema de comanda temporária demonstra como é possível conciliar necessidades operacionais com responsabilidade no tratamento de informações pessoais.

A implementação bem-sucedida deste projeto demonstra a viabilidade de soluções tecnológicas customizadas para nichos específicos de mercado, oferecendo alternativas mais adequadas do que sistemas genéricos disponíveis comercialmente. A flexibilidade da arquitetura desenvolvida permite futuras expansões, incluindo integração com sistemas de pagamento, relatórios avançados e funcionalidades de comunicação com usuários.

O sistema desenvolvido não apenas resolve os problemas imediatos identificados na gestão manual de quadras esportivas, mas também estabelece uma base sólida para futuras melhorias e expansões. A experiência adquirida durante o desenvolvimento reforça a importância de compreender profundamente as necessidades do usuário final antes de iniciar a implementação técnica.

Este trabalho contribui para o campo da tecnologia aplicada à gestão esportiva, demonstrando como soluções relativamente simples podem gerar impactos significativos na eficiência operacional e satisfação dos usuários. A metodologia empregada e os resultados obtidos podem servir como referência para futuros projetos similares, expandindo o uso de tecnologia em ambientes esportivos e recreativos.