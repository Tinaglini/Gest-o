import React, { useState, useEffect } from 'react';
import { getSales, deleteSale, getProducts, getClients } from '../../utils/storage';
import { formatCurrency, formatDate, PAYMENT_METHODS } from '../../utils/calculations';
import SaleForm from './SaleForm';
import InstallmentManager from './InstallmentManager';

const SaleList = () => {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [clients, setClients] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingSale, setEditingSale] = useState(null);
  const [showInstallments, setShowInstallments] = useState(false);
  const [selectedSaleId, setSelectedSaleId] = useState(null);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    status: '',
    paymentMethod: '',
    clientId: '',
    productId: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setSales(getSales());
    setProducts(getProducts());
    setClients(getClients());
  };

  const handleDelete = (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta venda?')) {
      deleteSale(id);
      loadData();
    }
  };

  const handleEdit = (sale) => {
    setEditingSale(sale);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingSale(null);
    loadData();
  };

  const handleManageInstallments = (saleId) => {
    setSelectedSaleId(saleId);
    setShowInstallments(true);
  };

  const handleInstallmentsClose = () => {
    setShowInstallments(false);
    setSelectedSaleId(null);
    loadData();
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      status: '',
      paymentMethod: '',
      clientId: '',
      productId: ''
    });
  };

  // Aplicar filtros
  const filteredSales = sales.filter(sale => {
    if (filters.startDate && sale.date < filters.startDate) return false;
    if (filters.endDate && sale.date > filters.endDate) return false;
    if (filters.status && sale.status !== filters.status) return false;
    if (filters.paymentMethod && sale.paymentMethod !== filters.paymentMethod) return false;
    if (filters.clientId && sale.clientId !== filters.clientId) return false;
    if (filters.productId && sale.productId !== filters.productId) return false;
    return true;
  });

  const getProductName = (productId) => {
    const product = products.find(p => p.id === productId);
    return product ? product.name : productId;
  };

  const getClientName = (clientId) => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.name : clientId;
  };

  const getStatusBadge = (status) => {
    const styles = {
      'Pendente': 'bg-yellow-100 text-yellow-800',
      'Pago': 'bg-green-100 text-green-800',
      'Entregue': 'bg-blue-100 text-blue-800'
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Vendas</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
        >
          + Nova Venda
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-gray-700">Filtros</h3>
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Limpar Filtros
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Data Inicial e Final */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data Inicial</label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data Final</label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              <option value="Pendente">Pendente</option>
              <option value="Pago">Pago</option>
              <option value="Entregue">Entregue</option>
            </select>
          </div>

          {/* Forma de Pagamento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Forma de Pagamento</label>
            <select
              name="paymentMethod"
              value={filters.paymentMethod}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas</option>
              {Object.entries(PAYMENT_METHODS).map(([key, value]) => (
                <option key={key} value={key}>{value.label}</option>
              ))}
            </select>
          </div>

          {/* Cliente */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
            <select
              name="clientId"
              value={filters.clientId}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>{client.id} - {client.name}</option>
              ))}
            </select>
          </div>

          {/* Produto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Produto</label>
            <select
              name="productId"
              value={filters.productId}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              {products.map(product => (
                <option key={product.id} value={product.id}>{product.id} - {product.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Resumo das vendas filtradas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500">Total de Vendas</div>
          <div className="text-2xl font-bold text-blue-600">{filteredSales.length}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500">Faturamento</div>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(filteredSales.reduce((sum, s) => sum + s.totalValue, 0))}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500">Lucro Líquido</div>
          <div className="text-2xl font-bold text-purple-600">
            {formatCurrency(filteredSales.reduce((sum, s) => sum + s.netProfit, 0))}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500">Ticket Médio</div>
          <div className="text-2xl font-bold text-orange-600">
            {formatCurrency(filteredSales.length > 0 ? filteredSales.reduce((sum, s) => sum + s.totalValue, 0) / filteredSales.length : 0)}
          </div>
        </div>
      </div>

      {/* Lista de vendas */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qtd</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Taxa</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lucro Líquido</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan="10" className="px-6 py-8 text-center text-gray-500">
                    Nenhuma venda encontrada
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{sale.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatDate(sale.date)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{getClientName(sale.clientId)}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{getProductName(sale.productId)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{sale.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">{formatCurrency(sale.totalValue)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">{formatCurrency(sale.fee)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-purple-600">{formatCurrency(sale.netProfit)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(sale.status)}`}>
                        {sale.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEdit(sale)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Editar
                      </button>
                      {sale.paymentMethod === 'PIX_INSTALLMENT' && (
                        <button
                          onClick={() => handleManageInstallments(sale.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Parcelas
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(sale.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal do formulário */}
      {showForm && (
        <SaleForm
          sale={editingSale}
          onClose={handleFormClose}
        />
      )}

      {/* Modal de gerenciamento de parcelas */}
      {showInstallments && (
        <InstallmentManager
          saleId={selectedSaleId}
          onClose={handleInstallmentsClose}
        />
      )}
    </div>
  );
};

export default SaleList;
