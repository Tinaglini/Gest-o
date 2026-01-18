import React, { useState, useEffect } from 'react';
import { getSales, getProducts, getClients } from '../utils/storage';
import { formatCurrency, calculateDashboardStats, PAYMENT_METHODS } from '../utils/calculations';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [clients, setClients] = useState([]);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    paymentMethod: '',
    status: '',
    productId: '',
    clientId: ''
  });

  useEffect(() => {
    loadStats();
  }, [filters]);

  const loadStats = () => {
    let sales = getSales();
    const allProducts = getProducts();
    const allClients = getClients();

    // Aplicar filtros
    if (filters.startDate) {
      sales = sales.filter(s => s.date >= filters.startDate);
    }
    if (filters.endDate) {
      sales = sales.filter(s => s.date <= filters.endDate);
    }
    if (filters.paymentMethod) {
      sales = sales.filter(s => s.paymentMethod === filters.paymentMethod);
    }
    if (filters.status) {
      sales = sales.filter(s => s.status === filters.status);
    }
    if (filters.productId) {
      sales = sales.filter(s => s.productId === filters.productId);
    }
    if (filters.clientId) {
      sales = sales.filter(s => s.clientId === filters.clientId);
    }

    const calculatedStats = calculateDashboardStats(sales, allProducts);
    setStats(calculatedStats);
    setProducts(allProducts);
    setClients(allClients);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      paymentMethod: '',
      status: '',
      productId: '',
      clientId: ''
    });
  };

  const getProductName = (productId) => {
    const product = products.find(p => p.id === productId);
    return product ? product.name : 'N/A';
  };

  if (!stats) {
    return <div className="text-center py-8">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600 mt-1">Visão geral do seu negócio de perfumes</p>
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
        </div>
      </div>

      {/* Indicadores Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Faturamento Total */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Faturamento Total</p>
              <p className="text-3xl font-bold mt-2">{formatCurrency(stats.totalRevenue)}</p>
            </div>
            <div className="text-4xl opacity-50">💰</div>
          </div>
        </div>

        {/* Lucro Total */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Lucro Total</p>
              <p className="text-3xl font-bold mt-2">{formatCurrency(stats.totalProfit)}</p>
            </div>
            <div className="text-4xl opacity-50">📈</div>
          </div>
        </div>

        {/* Margem Média */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Margem Média</p>
              <p className="text-3xl font-bold mt-2">{stats.averageMargin.toFixed(2)}%</p>
            </div>
            <div className="text-4xl opacity-50">📊</div>
          </div>
        </div>

        {/* Total de Vendas */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Total de Vendas</p>
              <p className="text-3xl font-bold mt-2">{stats.totalSales}</p>
            </div>
            <div className="text-4xl opacity-50">🛍️</div>
          </div>
        </div>

        {/* Ticket Médio */}
        <div className="bg-gradient-to-br from-pink-500 to-pink-600 text-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-pink-100 text-sm font-medium">Ticket Médio</p>
              <p className="text-3xl font-bold mt-2">{formatCurrency(stats.averageTicket)}</p>
            </div>
            <div className="text-4xl opacity-50">🎫</div>
          </div>
        </div>

        {/* Estoque Total */}
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-sm font-medium">Estoque Total</p>
              <p className="text-3xl font-bold mt-2">{stats.totalStock} un.</p>
            </div>
            <div className="text-4xl opacity-50">📦</div>
          </div>
        </div>

        {/* Total de Clientes */}
        <div className="bg-gradient-to-br from-teal-500 to-teal-600 text-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-teal-100 text-sm font-medium">Total de Clientes</p>
              <p className="text-3xl font-bold mt-2">{clients.length}</p>
            </div>
            <div className="text-4xl opacity-50">👥</div>
          </div>
        </div>

        {/* Produtos Cadastrados */}
        <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-cyan-100 text-sm font-medium">Produtos Cadastrados</p>
              <p className="text-3xl font-bold mt-2">{products.length}</p>
            </div>
            <div className="text-4xl opacity-50">🧴</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Produtos com Estoque Baixo */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <span className="text-2xl mr-2">⚠️</span>
            Produtos com Estoque Baixo
          </h3>
          {stats.lowStockProducts.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Nenhum produto com estoque baixo</p>
          ) : (
            <div className="space-y-2">
              {stats.lowStockProducts.map(product => (
                <div key={product.id} className="flex justify-between items-center p-3 bg-red-50 border border-red-200 rounded">
                  <div>
                    <p className="font-medium text-gray-800">{product.name}</p>
                    <p className="text-sm text-gray-600">{product.id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-red-600">{product.stock} un.</p>
                    <p className="text-xs text-gray-500">Estoque baixo</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Produto Mais Vendido */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <span className="text-2xl mr-2">🏆</span>
            Produto Mais Vendido
          </h3>
          {stats.mostSoldProduct ? (
            <div className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-300 rounded-lg">
              <p className="text-xl font-bold text-gray-800">{getProductName(stats.mostSoldProduct)}</p>
              <p className="text-sm text-gray-600 mt-1">{stats.mostSoldProduct}</p>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">Nenhuma venda registrada</p>
          )}
        </div>
      </div>

      {/* Formas de Pagamento */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <span className="text-2xl mr-2">💳</span>
          Distribuição por Forma de Pagamento
        </h3>
        {Object.keys(stats.paymentMethodsCount).length === 0 ? (
          <p className="text-gray-500 text-center py-4">Nenhuma venda registrada</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(stats.paymentMethodsCount).map(([method, count]) => (
              <div key={method} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                <p className="text-sm text-gray-600 mb-1">{PAYMENT_METHODS[method]?.label || method}</p>
                <p className="text-2xl font-bold text-blue-600">{count}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.totalSales > 0 ? ((count / stats.totalSales) * 100).toFixed(1) : 0}% do total
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Forma de Pagamento Mais Usada */}
      {stats.mostUsedPaymentMethod && (
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium mb-2">Forma de Pagamento Mais Usada</p>
              <p className="text-2xl font-bold">{PAYMENT_METHODS[stats.mostUsedPaymentMethod]?.label}</p>
            </div>
            <div className="text-6xl opacity-50">💎</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
