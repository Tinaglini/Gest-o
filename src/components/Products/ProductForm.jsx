import React, { useState, useEffect } from 'react';
import { addProduct, updateProduct, getProducts, generateId } from '../../utils/storage';
import { calculateMargin } from '../../utils/calculations';
import { validateProduct } from '../../utils/validators';

const ProductForm = ({ product, onClose }) => {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    purchasePrice: '',
    salePrice: '',
    margin: 0,
    stock: 0,
    supplier: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (product) {
      setFormData(product);
    } else {
      const products = getProducts();
      const newId = generateId('P', products);
      setFormData(prev => ({ ...prev, id: newId }));
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };

      // Calcular margem automaticamente
      if (name === 'purchasePrice' || name === 'salePrice') {
        const purchase = parseFloat(name === 'purchasePrice' ? value : prev.purchasePrice) || 0;
        const sale = parseFloat(name === 'salePrice' ? value : prev.salePrice) || 0;
        updated.margin = calculateMargin(purchase, sale);
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
      purchasePrice: parseFloat(formData.purchasePrice) || 0,
      salePrice: parseFloat(formData.salePrice) || 0,
      stock: parseInt(formData.stock) || 0
    };

    // Validar
    const validation = validateProduct(dataToValidate);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    // Salvar
    const productData = {
      ...dataToValidate,
      margin: calculateMargin(dataToValidate.purchasePrice, dataToValidate.salePrice)
    };

    if (product) {
      updateProduct(product.id, productData);
    } else {
      addProduct(productData);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">
            {product ? 'Editar Produto' : 'Novo Produto'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* ID do Produto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ID do Produto
            </label>
            <input
              type="text"
              value={formData.id}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
            />
          </div>

          {/* Nome Completo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome Completo <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ex: Polo Black 125ml"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          {/* Valor de Compra e Venda */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valor de Compra (R$) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="purchasePrice"
                value={formData.purchasePrice}
                onChange={handleChange}
                step="0.01"
                min="0"
                placeholder="0.00"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.purchasePrice ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.purchasePrice && <p className="text-red-500 text-sm mt-1">{errors.purchasePrice}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valor de Venda (R$) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="salePrice"
                value={formData.salePrice}
                onChange={handleChange}
                step="0.01"
                min="0"
                placeholder="0.00"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.salePrice ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.salePrice && <p className="text-red-500 text-sm mt-1">{errors.salePrice}</p>}
            </div>
          </div>

          {/* Margem de Lucro (calculada) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Margem de Lucro (%)
            </label>
            <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 font-semibold">
              {formData.margin.toFixed(2)}%
            </div>
            <p className="text-xs text-gray-500 mt-1">Calculado automaticamente</p>
          </div>

          {/* Estoque e Fornecedor */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantidade em Estoque <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                min="0"
                placeholder="0"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.stock ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.stock && <p className="text-red-500 text-sm mt-1">{errors.stock}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fornecedor (opcional)
              </label>
              <input
                type="text"
                name="supplier"
                value={formData.supplier}
                onChange={handleChange}
                placeholder="Nome do fornecedor"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

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
              {product ? 'Salvar Alterações' : 'Adicionar Produto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
