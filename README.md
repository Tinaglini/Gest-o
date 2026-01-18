# Sistema de Gestão de Vendas de Perfumes 💎

Sistema completo para gerenciar vendas de perfumes com controle financeiro detalhado.

## Características Principais

### Gestão de Produtos 🧴
- Cadastro completo de produtos (ID, nome, valores, estoque)
- Cálculo automático de margem de lucro
- Alertas de estoque baixo (≤ 3 unidades)
- Controle de fornecedores

### Gestão de Clientes 👥
- Cadastro completo com CPF, telefone e endereço
- Validação automática de CPF
- Formatação automática de CPF e telefone
- Histórico de cadastro

### Gestão de Vendas 🛍️
- Registro completo de vendas
- Cálculos automáticos:
  - Valor total da venda
  - Taxas por forma de pagamento
  - Lucro líquido
- Controle de estoque automático
- Sistema de descontos em valor fixo (R$)
- Múltiplas formas de pagamento

### Formas de Pagamento Suportadas

**Mercado Pago - Link de Pagamento:**
- Pix via Link MP (0,99%)
- Cartão de Crédito à vista - na hora (4,98%)
- Cartão de Crédito à vista - 14 dias (4,49%)
- Cartão de Crédito à vista - 30 dias (3,99%)
- Débito Virtual Caixa (3,99%)
- Boleto (R$ 3,49 fixo)

**Outros:**
- Pix Parcelado para Conhecidos (0% de taxa)
- Dinheiro (0% de taxa)

### Sistema de Parcelas 💳
- Controle completo de parcelas para "Pix Parcelado Conhecidos"
- Acompanhamento de cada parcela individualmente
- Status: Pendente / Recebida
- Controle de datas de vencimento e pagamento
- Barra de progresso visual

### Dashboard 📊
- Faturamento total
- Lucro total e margem média
- Ticket médio
- Total de vendas
- Estoque total
- Produtos com estoque baixo
- Produto mais vendido
- Distribuição por forma de pagamento
- Filtros avançados por período, cliente, produto, status

## Tecnologias Utilizadas

- **React** - Framework frontend
- **Vite** - Build tool
- **Tailwind CSS** - Estilização
- **LocalStorage** - Persistência de dados

## Como Usar

### Instalação

```bash
# Instalar dependências
npm install

# Executar em modo de desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview
```

### Primeiro Acesso

1. Acesse o sistema pelo navegador
2. Cadastre seus produtos no menu "Produtos"
3. Cadastre seus clientes no menu "Clientes"
4. Registre suas vendas no menu "Vendas"
5. Acompanhe os resultados no "Dashboard"

## Estrutura de Dados

### Produtos
- ID: P001, P002, P003...
- Nome, Valor de Compra, Valor de Venda
- Margem calculada automaticamente
- Estoque e Fornecedor

### Clientes
- ID: C001, C002, C003...
- Nome, CPF, Telefone, Endereço
- Data de cadastro

### Vendas
- ID: V001, V002, V003...
- Data, Cliente, Produto, Quantidade
- Valor unitário, Desconto (em R$)
- Valor total, Taxa, Lucro líquido
- Forma de pagamento e Status

### Parcelas (Pix Parcelado)
- ID da venda + número da parcela
- Valor, Data de vencimento
- Status (Pendente/Recebida)
- Data de pagamento

## Validações Implementadas

- CPF válido e formatado
- Valores não negativos
- Desconto não maior que o valor total
- Estoque suficiente para venda
- Campos obrigatórios preenchidos

## Funcionalidades Extras

- Formatação automática de valores monetários
- Formatação automática de CPF e telefone
- Busca e filtros em todas as telas
- Interface responsiva
- Confirmações antes de excluir
- Alertas visuais (estoque baixo, validações)

## Suporte

Para dúvidas ou sugestões, entre em contato.

---

**Sistema de Gestão de Vendas de Perfumes** © 2025
