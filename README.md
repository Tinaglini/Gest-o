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
- **Cálculo Automático de Ajuste de Preço por Frete 🚚**:
  - Sistema inteligente que calcula automaticamente quanto cobrar no produto para manter o mesmo lucro quando há frete
  - Suporte para múltiplos tipos de entrega (Retirada, Correios PAC/SEDEX, Motoboy)
  - Preço ajustado sugerido automaticamente
  - Comparação visual entre lucro com e sem frete
  - Alertas quando o preço está abaixo do recomendado

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

### Cálculo de Imposto de Renda 💰
- **Carnê-Leão com dedução simplificada (20%)**
- Cálculo automático baseado nas vendas dos últimos 30 dias
- Cálculo manual por faturamento informado
- Tabela progressiva IR 2025 completa
- Projeção anual de IR
- Análise com custos reais (opcional)
- Alíquota efetiva calculada
- Exemplos de validação para teste

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
- **Tipo de Entrega** (Retirada, PAC, SEDEX, Motoboy, Outros)
- **Valor do Frete** (R$)
- **Preço Ajustado Sugerido** (calculado automaticamente)
- **Preço Final do Produto** (editável)
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

## Cálculo Automático de Ajuste de Preço por Frete

### Como Funciona

Quando você adiciona frete a uma venda, o Mercado Pago cobra taxa sobre o **valor total** (produto + frete), o que reduz seu lucro. O sistema resolve isso automaticamente!

**Exemplo Prático:**

**SEM FRETE:**
- Produto: R$ 200,00
- Taxa MP (4,98%): R$ 9,96
- Custo: R$ 100,00
- **Lucro: R$ 90,04**

**COM FRETE (sem ajustar):**
- Produto: R$ 200,00
- Frete: R$ 30,00
- Total: R$ 230,00
- Taxa MP (4,98% sobre R$ 230): R$ 11,45
- **Lucro: R$ 88,55** ❌ (perdeu R$ 1,49!)

**COM FRETE (ajustado automaticamente):**
- Sistema sugere: R$ 213,17
- Frete: R$ 30,00
- Total: R$ 243,17
- Taxa MP: R$ 12,11
- **Lucro: R$ 101,06** ✅ (mantém o lucro!)

### Funcionalidades de Frete

1. **Cálculo Automático**: Digite o valor do frete e o sistema calcula o preço ajustado
2. **Tipos de Entrega**: Retirada no Local, Correios PAC, SEDEX, Motoboy, Outros
3. **Comparação Visual**: Veja lado a lado o lucro com e sem frete
4. **Alertas Inteligentes**: Aviso quando o preço está abaixo do recomendado
5. **Campo Editável**: Você pode ajustar manualmente se preferir

## Cálculo de Imposto de Renda (Carnê-Leão)

### Como Funciona

Sistema completo para calcular o IR mensal de pessoa física autônoma usando a **dedução simplificada de 20%**.

**ETAPA 1: Base de Cálculo**
```
Base de Cálculo = Faturamento Mensal × 0,80
```
(Deduz automaticamente 20% do faturamento)

**ETAPA 2: Aplicar Tabela Progressiva 2025**

| Base de Cálculo | Alíquota | Dedução |
|-----------------|----------|---------|
| Até R$ 2.259,20 | Isento | - |
| R$ 2.259,21 a R$ 2.826,65 | 7,5% | R$ 169,44 |
| R$ 2.826,66 a R$ 4.664,68 | 15% | R$ 381,44 |
| R$ 4.664,69 a R$ 5.839,45 | 22,5% | R$ 662,77 |
| Acima de R$ 5.839,45 | 27,5% | R$ 896,00 |

**Fórmula:**
```
IR Devido = (Base de Cálculo × Alíquota) - Dedução
```

### Exemplos Práticos

**Exemplo 1: Faturamento R$ 3.000,00**
- Base: R$ 2.400,00 (80%)
- Faixa: 7,5%
- IR: (2.400 × 7,5%) - 169,44 = **R$ 10,56**
- Alíquota efetiva: **0,35%**

**Exemplo 2: Faturamento R$ 5.000,00**
- Base: R$ 4.000,00 (80%)
- Faixa: 15%
- IR: (4.000 × 15%) - 381,44 = **R$ 218,56**
- Alíquota efetiva: **4,37%**

**Exemplo 3: Faturamento R$ 11.400,00**
- Base: R$ 9.120,00 (80%)
- Faixa: 27,5%
- IR: (9.120 × 27,5%) - 896,00 = **R$ 1.612,00**
- Alíquota efetiva: **14,14%**

### Funcionalidades do Cálculo de IR

1. **Cálculo Automático**: Sistema calcula baseado nas vendas dos últimos 30 dias
2. **Cálculo Manual**: Digite o faturamento manualmente
3. **Custos Reais**: Opção de incluir custos para ver lucro após IR
4. **Projeção Anual**: Veja quanto pagará de IR no ano
5. **Alíquota Efetiva**: Percentual real sobre o faturamento
6. **Informações de Pagamento**: Prazo, DARF, etc.

### Informações Importantes

- Pagamento até o **último dia útil do mês seguinte**
- Use **DARF código 0190**
- Dedução simplificada é automática (20%)
- Valores já consideram a tabela 2025
- Consulte um contador para situações específicas

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
