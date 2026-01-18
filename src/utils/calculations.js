// Funções de cálculo para o sistema

// Formas de pagamento e suas taxas
export const PAYMENT_METHODS = {
  PIX_MP: { label: 'Pix via Link MP', rate: 0.0099, type: 'percentage' },
  CREDIT_NOW: { label: 'Cartão Crédito na hora (Link MP)', rate: 0.0498, type: 'percentage' },
  CREDIT_14: { label: 'Cartão Crédito 14 dias (Link MP)', rate: 0.0449, type: 'percentage' },
  CREDIT_30: { label: 'Cartão Crédito 30 dias (Link MP)', rate: 0.0399, type: 'percentage' },
  DEBIT_CAIXA: { label: 'Débito Virtual Caixa (Link MP)', rate: 0.0399, type: 'percentage' },
  BOLETO: { label: 'Boleto (Link MP)', rate: 3.49, type: 'fixed' },
  PIX_INSTALLMENT: { label: 'Pix Parcelado Conhecidos', rate: 0, type: 'none' },
  CASH: { label: 'Dinheiro', rate: 0, type: 'none' }
};

// Calcular margem de lucro do produto
export const calculateMargin = (purchasePrice, salePrice) => {
  if (purchasePrice <= 0) return 0;
  return ((salePrice - purchasePrice) / purchasePrice) * 100;
};

// Calcular valor total da venda
export const calculateSaleTotal = (unitPrice, quantity, discount) => {
  const total = (unitPrice * quantity) - discount;
  return Math.max(0, total); // Não permitir valores negativos
};

// Calcular taxa em R$ baseada na forma de pagamento
export const calculateFee = (paymentMethod, totalValue) => {
  const method = PAYMENT_METHODS[paymentMethod];
  if (!method) return 0;

  if (method.type === 'percentage') {
    return totalValue * method.rate;
  } else if (method.type === 'fixed') {
    return method.rate;
  }
  return 0;
};

// Calcular lucro líquido
export const calculateNetProfit = (saleTotal, purchasePrice, quantity, fee) => {
  const totalCost = purchasePrice * quantity;
  return saleTotal - totalCost - fee;
};

// Validar CPF
export const validateCPF = (cpf) => {
  // Remove caracteres não numéricos
  cpf = cpf.replace(/[^\d]/g, '');

  // Verifica se tem 11 dígitos
  if (cpf.length !== 11) return false;

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(cpf)) return false;

  // Validação dos dígitos verificadores
  let sum = 0;
  let remainder;

  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
  }

  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.substring(9, 10))) return false;

  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
  }

  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.substring(10, 11))) return false;

  return true;
};

// Formatar CPF
export const formatCPF = (cpf) => {
  cpf = cpf.replace(/[^\d]/g, '');
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

// Formatar moeda
export const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

// Formatar data
export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('pt-BR');
};

// Calcular parcelas para Pix Parcelado Conhecidos
export const calculateInstallments = (totalValue, numInstallments) => {
  const installmentValue = totalValue / numInstallments;
  return {
    numInstallments,
    installmentValue: Math.round(installmentValue * 100) / 100
  };
};

// Formatar telefone
export const formatPhone = (phone) => {
  phone = phone.replace(/[^\d]/g, '');
  if (phone.length === 11) {
    return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (phone.length === 10) {
    return phone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  return phone;
};

// Validar desconto
export const validateDiscount = (discount, total) => {
  if (discount < 0) return false;
  if (discount > total) return false;
  return true;
};

// Calcular estatísticas do dashboard
export const calculateDashboardStats = (sales, products) => {
  // Faturamento total
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalValue, 0);

  // Lucro total
  const totalProfit = sales.reduce((sum, sale) => sum + sale.netProfit, 0);

  // Margem média
  const averageMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  // Total de vendas
  const totalSales = sales.length;

  // Ticket médio
  const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0;

  // Estoque total
  const totalStock = products.reduce((sum, product) => sum + product.stock, 0);

  // Produtos com estoque baixo
  const lowStockProducts = products.filter(p => p.stock <= 3);

  // Produto mais vendido
  const productSalesCount = {};
  sales.forEach(sale => {
    productSalesCount[sale.productId] = (productSalesCount[sale.productId] || 0) + sale.quantity;
  });

  let mostSoldProduct = null;
  let maxQuantity = 0;
  Object.keys(productSalesCount).forEach(productId => {
    if (productSalesCount[productId] > maxQuantity) {
      maxQuantity = productSalesCount[productId];
      mostSoldProduct = productId;
    }
  });

  // Forma de pagamento mais usada
  const paymentMethodsCount = {};
  sales.forEach(sale => {
    paymentMethodsCount[sale.paymentMethod] = (paymentMethodsCount[sale.paymentMethod] || 0) + 1;
  });

  let mostUsedPaymentMethod = null;
  let maxCount = 0;
  Object.keys(paymentMethodsCount).forEach(method => {
    if (paymentMethodsCount[method] > maxCount) {
      maxCount = paymentMethodsCount[method];
      mostUsedPaymentMethod = method;
    }
  });

  return {
    totalRevenue,
    totalProfit,
    averageMargin,
    totalSales,
    averageTicket,
    totalStock,
    lowStockProducts,
    mostSoldProduct,
    mostUsedPaymentMethod,
    paymentMethodsCount
  };
};
