import React, { useState, useEffect } from 'react';
import {
  addSale,
  updateSale,
  getSales,
  getProducts,
  getClients,
  generateId,
  updateProduct,
  addInstallments
} from '../../utils/storage';
import {
  formatCurrency,
  PAYMENT_METHODS,
  DELIVERY_TYPES,
  calculateInstallments,
  calculateProfitWithoutShipping,
  calculateAdjustedPrice,
  calculateTotalsWithShipping,
  compareShippingProfit
} from '../../utils/calculations';
import { validateSale } from '../../utils/validators';

const SaleForm = ({ sale, onClose }) => {
  const [products, setProducts] = useState([]);
  const [clients, setClients] = useState([]);
  const [formData, setFormData] = useState({
    id: '',
    date: new Date().toISOString().split('T')[0],
    clientId: '',
    productId: '',
    quantity: 1,
    unitPrice: 0,
    discount: 0,
    deliveryType: 'PICKUP',
    shippingCost: 0,
    adjustedPrice: 0,
    finalProductPrice: 0,
    totalValue: 0,
    paymentMethod: '',
    fee: 0,
    netProfit: 0,
    status: 'Pendente',
    numInstallments: 1,
    installmentValue: 0
  });

  const [errors, setErrors] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [shippingCalculations, setShippingCalculations] = useState(null);
  const [profitComparison, setProfitComparison] = useState(null);

  useEffect(() => {
    setProducts(getProducts());
    setClients(getClients());

    if (sale) {
      setFormData(sale);
      const product = getProducts().find(p => p.id === sale.productId);
      setSelectedProduct(product);
    } else {
      const sales = getSales();
      const newId = generateId('V', sales);
      setFormData(prev => ({ ...prev, id: newId }));
    }
  }, [sale]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      let updated = { ...prev, [name]: value };

      // Se selecionou um produto, atualizar o preço unitário
      if (name === 'productId') {
        const product = products.find(p => p.id === value);
        setSelectedProduct(product);
        if (product) {
          updated.unitPrice = product.salePrice;
          updated.finalProductPrice = product.salePrice;
        }
      }

      // Se mudou tipo de entrega para "Retirada no Local", zerar frete
      if (name === 'deliveryType' && value === 'PICKUP') {
        updated.shippingCost = 0;
      }

      // Valores numéricos
      const quantity = parseInt(name === 'quantity' ? value : updated.quantity) || 0;
      const unitPrice = parseFloat(name === 'unitPrice' ? value : updated.unitPrice) || 0;
      const discount = parseFloat(name === 'discount' ? value : updated.discount) || 0;
      const shippingCost = parseFloat(name === 'shippingCost' ? value : updated.shippingCost) || 0;
      const paymentMethod = name === 'paymentMethod' ? value : updated.paymentMethod;

      // ETAPA 1: Calcular lucro SEM frete
      let profitWithoutShipping = 0;
      if (selectedProduct && paymentMethod) {
        const calc = calculateProfitWithoutShipping(
          unitPrice,
          selectedProduct.purchasePrice,
          quantity,
          discount,
          paymentMethod
        );
        profitWithoutShipping = calc.profit;
      }

      // ETAPA 2: Calcular preço ajustado sugerido (se houver frete)
      let adjustedPrice = 0;
      if (selectedProduct && paymentMethod && shippingCost > 0) {
        adjustedPrice = calculateAdjustedPrice(
          profitWithoutShipping,
          selectedProduct.purchasePrice,
          quantity,
          shippingCost,
          paymentMethod
        );
        updated.adjustedPrice = adjustedPrice;

        // Preencher automaticamente o campo "finalProductPrice" com o preço ajustado
        // APENAS se o usuário não estiver editando manualmente esse campo
        if (name !== 'finalProductPrice') {
          updated.finalProductPrice = adjustedPrice;
        }
      } else {
        // Sem frete, usar preço original
        updated.adjustedPrice = 0;
        if (name !== 'finalProductPrice') {
          updated.finalProductPrice = unitPrice;
        }
      }

      // ETAPA 3: Calcular totais finais com o preço final do produto
      const finalProductPrice = parseFloat(
        name === 'finalProductPrice' ? value : updated.finalProductPrice
      ) || unitPrice;

      if (selectedProduct && paymentMethod) {
        const totals = calculateTotalsWithShipping(
          finalProductPrice,
          selectedProduct.purchasePrice,
          quantity,
          discount,
          shippingCost,
          paymentMethod
        );

        updated.totalValue = totals.totalCharged;
        updated.fee = totals.fee;
        updated.netProfit = totals.netProfit;

        // Guardar cálculos para exibição
        setShippingCalculations({
          productSubtotal: totals.productSubtotal,
          shippingCost: shippingCost,
          totalCharged: totals.totalCharged,
          fee: totals.fee,
          profitWithoutShipping: profitWithoutShipping,
          profitWithShipping: totals.netProfit
        });

        // Comparar lucros
        const comparison = compareShippingProfit(profitWithoutShipping, totals.netProfit);
        setProfitComparison(comparison);
      }

      // Calcular parcelas para Pix Parcelado
      if (paymentMethod === 'PIX_INSTALLMENT') {
        const numInstallments = parseInt(name === 'numInstallments' ? value : updated.numInstallments) || 1;
        const installmentCalc = calculateInstallments(updated.totalValue, numInstallments);
        updated.installmentValue = installmentCalc.installmentValue;
      }

      return updated;
    });

    // Limpar erro do campo
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Preparar dados para validação
    const dataToValidate = {
      ...formData,
      quantity: parseInt(formData.quantity) || 0,
      unitPrice: parseFloat(formData.unitPrice) || 0,
      discount: parseFloat(formData.discount) || 0,
      shippingCost: parseFloat(formData.shippingCost) || 0,
      finalProductPrice: parseFloat(formData.finalProductPrice) || 0
    };

    // Validar estoque disponível
    const availableStock = selectedProduct ? selectedProduct.stock : 0;
    const validation = validateSale(dataToValidate, availableStock);

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    // Salvar venda
    const saleData = {
      ...dataToValidate,
      totalValue: parseFloat(formData.totalValue),
      fee: parseFloat(formData.fee),
      netProfit: parseFloat(formData.netProfit),
      adjustedPrice: parseFloat(formData.adjustedPrice) || 0
    };

    if (sale) {
      updateSale(sale.id, saleData);
    } else {
      addSale(saleData);

      // Atualizar estoque se status for Pago ou Entregue
      if (saleData.status === 'Pago' || saleData.status === 'Entregue') {
        const newStock = selectedProduct.stock - saleData.quantity;
        updateProduct(selectedProduct.id, { stock: newStock });
      }

      // Criar parcelas se for Pix Parcelado
      if (saleData.paymentMethod === 'PIX_INSTALLMENT') {
        const installments = [];
        for (let i = 1; i <= saleData.numInstallments; i++) {
          installments.push({
            id: `${saleData.id}-P${i}`,
            saleId: saleData.id,
            installmentNumber: i,
            totalInstallments: saleData.numInstallments,
            value: saleData.installmentValue,
            dueDate: '',
            paymentDate: '',
            status: 'Pendente'
          });
        }
        addInstallments(installments);
      }
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">
            {sale ? 'Editar Venda' : 'Nova Venda'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Informações Básicas */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ID da Venda</label>
              <input
                type="text"
                value={formData.id}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data da Venda <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.date ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.status ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="Pendente">Pendente</option>
                <option value="Pago">Pago</option>
                <option value="Entregue">Entregue</option>
              </select>
              {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status}</p>}
            </div>
          </div>

          {/* Cliente e Produto */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cliente <span className="text-red-500">*</span>
              </label>
              <select
                name="clientId"
                value={formData.clientId}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.clientId ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Selecione um cliente</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.id} - {client.name}
                  </option>
                ))}
              </select>
              {errors.clientId && <p className="text-red-500 text-sm mt-1">{errors.clientId}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Produto <span className="text-red-500">*</span>
              </label>
              <select
                name="productId"
                value={formData.productId}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.productId ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Selecione um produto</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.id} - {product.name} (Estoque: {product.stock})
                  </option>
                ))}
              </select>
              {errors.productId && <p className="text-red-500 text-sm mt-1">{errors.productId}</p>}
            </div>
          </div>

          {/* Quantidade, Preço Original e Desconto */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantidade <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                min="1"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.quantity ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.quantity && <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>}
              {selectedProduct && (
                <p className="text-xs text-gray-500 mt-1">Estoque disponível: {selectedProduct.stock}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preço Original do Produto (R$) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="unitPrice"
                value={formData.unitPrice}
                onChange={handleChange}
                step="0.01"
                min="0"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.unitPrice ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.unitPrice && <p className="text-red-500 text-sm mt-1">{errors.unitPrice}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Desconto (R$)
              </label>
              <input
                type="number"
                name="discount"
                value={formData.discount}
                onChange={handleChange}
                step="0.01"
                min="0"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.discount ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.discount && <p className="text-red-500 text-sm mt-1">{errors.discount}</p>}
            </div>
          </div>

          {/* Forma de Pagamento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Forma de Pagamento <span className="text-red-500">*</span>
            </label>
            <select
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.paymentMethod ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Selecione a forma de pagamento</option>
              {Object.entries(PAYMENT_METHODS).map(([key, value]) => (
                <option key={key} value={key}>{value.label}</option>
              ))}
            </select>
            {errors.paymentMethod && <p className="text-red-500 text-sm mt-1">{errors.paymentMethod}</p>}
          </div>

          {/* SEÇÃO DE FRETE */}
          <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-4 space-y-4">
            <h3 className="font-bold text-purple-900 text-lg flex items-center">
              <span className="text-2xl mr-2">🚚</span>
              Entrega e Frete
            </h3>

            <div className="grid grid-cols-2 gap-4">
              {/* Tipo de Entrega */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Entrega <span className="text-red-500">*</span>
                </label>
                <select
                  name="deliveryType"
                  value={formData.deliveryType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  {Object.entries(DELIVERY_TYPES).map(([key, value]) => (
                    <option key={key} value={key}>{value}</option>
                  ))}
                </select>
              </div>

              {/* Valor do Frete */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor do Frete (R$)
                </label>
                <input
                  type="number"
                  name="shippingCost"
                  value={formData.shippingCost}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  disabled={formData.deliveryType === 'PICKUP'}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 ${
                    formData.deliveryType === 'PICKUP' ? 'bg-gray-100 text-gray-500' : 'border-gray-300'
                  }`}
                />
                {formData.deliveryType === 'PICKUP' && (
                  <p className="text-xs text-gray-500 mt-1">Sem frete para retirada no local</p>
                )}
              </div>
            </div>

            {/* Preço Ajustado Sugerido */}
            {formData.shippingCost > 0 && formData.adjustedPrice > 0 && (
              <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <span className="text-xl">💡</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-yellow-900">
                      Preço Ajustado Sugerido para manter seu lucro:
                    </p>
                    <p className="text-2xl font-bold text-yellow-900 mt-1">
                      {formatCurrency(formData.adjustedPrice)}
                    </p>
                    <p className="text-xs text-yellow-700 mt-1">
                      Cobre este valor pelo produto para compensar a taxa do MP sobre o frete
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Preço Final a Cobrar */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preço Final do Produto a Cobrar (R$) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="finalProductPrice"
                value={formData.finalProductPrice}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-semibold text-lg"
              />
              <p className="text-xs text-gray-600 mt-1">
                {formData.shippingCost > 0
                  ? 'Editável - pré-preenchido com o preço ajustado sugerido'
                  : 'Sem frete, usando preço original do produto'
                }
              </p>
            </div>

            {/* Alerta se preço for menor que o sugerido */}
            {formData.shippingCost > 0 &&
             formData.adjustedPrice > 0 &&
             formData.finalProductPrice < formData.adjustedPrice &&
             profitComparison?.isLower && (
              <div className="bg-red-50 border border-red-300 rounded-lg p-3 flex items-start space-x-2">
                <span className="text-xl">⚠️</span>
                <div>
                  <p className="text-sm font-semibold text-red-900">
                    Atenção: Seu lucro será menor que o esperado!
                  </p>
                  <p className="text-xs text-red-700 mt-1">
                    Diferença: {formatCurrency(profitComparison.difference)} ({profitComparison.percentageChange.toFixed(2)}%)
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Resumo da Venda COM FRETE */}
          {shippingCalculations && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-3">Resumo da Venda</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal Produto ({formData.quantity} × {formatCurrency(formData.finalProductPrice)}):</span>
                  <span className="font-medium">{formatCurrency(formData.finalProductPrice * formData.quantity)}</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>Desconto:</span>
                  <span className="font-medium">- {formatCurrency(formData.discount)}</span>
                </div>
                <div className="flex justify-between border-t border-blue-300 pt-2">
                  <span>Valor do Produto:</span>
                  <span className="font-medium">{formatCurrency(shippingCalculations.productSubtotal)}</span>
                </div>
                <div className="flex justify-between text-purple-600">
                  <span>+ Frete:</span>
                  <span className="font-medium">{formatCurrency(shippingCalculations.shippingCost)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-blue-900 border-t-2 border-blue-400 pt-2">
                  <span>Total a Cobrar do Cliente:</span>
                  <span>{formatCurrency(shippingCalculations.totalCharged)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Parcelas para Pix Parcelado */}
          {formData.paymentMethod === 'PIX_INSTALLMENT' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-4">
              <h3 className="font-semibold text-yellow-800">Pix Parcelado para Conhecidos</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número de Parcelas <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="numInstallments"
                    value={formData.numInstallments}
                    onChange={handleChange}
                    min="1"
                    max="12"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      errors.numInstallments ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.numInstallments && <p className="text-red-500 text-sm mt-1">{errors.numInstallments}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valor da Parcela</label>
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 font-semibold">
                    {formatCurrency(formData.installmentValue)}
                  </div>
                </div>
              </div>
              <p className="text-sm text-yellow-700">
                As parcelas serão criadas automaticamente após salvar a venda.
              </p>
            </div>
          )}

          {/* Cálculos Finais com Comparação */}
          {shippingCalculations && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-3">Cálculos Finais e Comparação</h3>

              <div className="grid grid-cols-2 gap-4 mb-4">
                {/* Lucro SEM Frete */}
                <div className="bg-white border border-gray-300 rounded-lg p-3">
                  <p className="text-xs text-gray-600 font-medium mb-1">LUCRO SEM FRETE</p>
                  <p className="text-lg font-bold text-gray-700">
                    {formatCurrency(shippingCalculations.profitWithoutShipping)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    (Preço original: {formatCurrency(formData.unitPrice)})
                  </p>
                </div>

                {/* Lucro COM Frete */}
                <div className={`border rounded-lg p-3 ${
                  profitComparison?.isLower ? 'bg-red-100 border-red-300' :
                  profitComparison?.isHigher ? 'bg-green-100 border-green-300' :
                  'bg-blue-100 border-blue-300'
                }`}>
                  <p className="text-xs font-medium mb-1 ${
                    profitComparison?.isLower ? 'text-red-700' :
                    profitComparison?.isHigher ? 'text-green-700' :
                    'text-blue-700'
                  }">LUCRO COM FRETE AJUSTADO</p>
                  <p className={`text-lg font-bold ${
                    profitComparison?.isLower ? 'text-red-900' :
                    profitComparison?.isHigher ? 'text-green-900' :
                    'text-blue-900'
                  }`}>
                    {formatCurrency(shippingCalculations.profitWithShipping)}
                  </p>
                  {profitComparison && !profitComparison.isSame && (
                    <p className="text-xs mt-1">
                      {profitComparison.isLower ? '↓' : '↑'} {formatCurrency(Math.abs(profitComparison.difference))}
                    </p>
                  )}
                </div>
              </div>

              {/* Detalhamento */}
              <div className="space-y-1 text-sm border-t border-green-300 pt-3">
                <div className="flex justify-between">
                  <span>Total Cliente Paga:</span>
                  <span className="font-medium">{formatCurrency(shippingCalculations.totalCharged)}</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>Taxa MP ({formData.paymentMethod ? PAYMENT_METHODS[formData.paymentMethod]?.label : 'N/A'}):</span>
                  <span className="font-medium">- {formatCurrency(shippingCalculations.fee)}</span>
                </div>
                {selectedProduct && (
                  <div className="flex justify-between text-red-600">
                    <span>Custo Produto ({formData.quantity} × {formatCurrency(selectedProduct.purchasePrice)}):</span>
                    <span className="font-medium">- {formatCurrency(selectedProduct.purchasePrice * formData.quantity)}</span>
                  </div>
                )}
                {formData.shippingCost > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Custo Frete (repassado):</span>
                    <span className="font-medium">- {formatCurrency(formData.shippingCost)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xl font-bold text-green-900 border-t-2 border-green-400 pt-2">
                  <span>Lucro Líquido Final:</span>
                  <span>{formatCurrency(formData.netProfit)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Botões */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
            >
              {sale ? 'Salvar Alterações' : 'Registrar Venda'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SaleForm;
