import { validateCPF } from './calculations';

// Validar produto
export const validateProduct = (product) => {
  const errors = {};

  if (!product.name || product.name.trim() === '') {
    errors.name = 'Nome do produto é obrigatório';
  }

  if (!product.purchasePrice || product.purchasePrice <= 0) {
    errors.purchasePrice = 'Valor de compra deve ser maior que zero';
  }

  if (!product.salePrice || product.salePrice <= 0) {
    errors.salePrice = 'Valor de venda deve ser maior que zero';
  }

  if (product.purchasePrice && product.salePrice && product.purchasePrice > product.salePrice) {
    errors.salePrice = 'Valor de venda deve ser maior que o valor de compra';
  }

  if (product.stock < 0) {
    errors.stock = 'Estoque não pode ser negativo';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Validar cliente
export const validateClient = (client) => {
  const errors = {};

  if (!client.name || client.name.trim() === '') {
    errors.name = 'Nome do cliente é obrigatório';
  }

  if (!client.cpf || client.cpf.trim() === '') {
    errors.cpf = 'CPF é obrigatório';
  } else if (!validateCPF(client.cpf)) {
    errors.cpf = 'CPF inválido';
  }

  if (!client.phone || client.phone.trim() === '') {
    errors.phone = 'Telefone é obrigatório';
  }

  if (!client.address || client.address.trim() === '') {
    errors.address = 'Endereço é obrigatório';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Validar venda
export const validateSale = (sale, availableStock) => {
  const errors = {};

  if (!sale.clientId) {
    errors.clientId = 'Cliente é obrigatório';
  }

  if (!sale.productId) {
    errors.productId = 'Produto é obrigatório';
  }

  if (!sale.quantity || sale.quantity <= 0) {
    errors.quantity = 'Quantidade deve ser maior que zero';
  }

  if (sale.quantity > availableStock) {
    errors.quantity = `Quantidade em estoque insuficiente. Disponível: ${availableStock}`;
  }

  if (!sale.unitPrice || sale.unitPrice <= 0) {
    errors.unitPrice = 'Valor unitário deve ser maior que zero';
  }

  if (sale.discount < 0) {
    errors.discount = 'Desconto não pode ser negativo';
  }

  const totalBeforeDiscount = sale.unitPrice * sale.quantity;
  if (sale.discount > totalBeforeDiscount) {
    errors.discount = 'Desconto não pode ser maior que o valor total';
  }

  if (!sale.paymentMethod) {
    errors.paymentMethod = 'Forma de pagamento é obrigatória';
  }

  if (!sale.status) {
    errors.status = 'Status é obrigatório';
  }

  if (!sale.date) {
    errors.date = 'Data da venda é obrigatória';
  }

  // Validar parcelas para Pix Parcelado
  if (sale.paymentMethod === 'PIX_INSTALLMENT') {
    if (!sale.numInstallments || sale.numInstallments <= 0) {
      errors.numInstallments = 'Número de parcelas é obrigatório para Pix Parcelado';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
