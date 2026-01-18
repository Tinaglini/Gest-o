import React, { useState, useEffect } from 'react';
import { getInstallmentsBySaleId, updateInstallment } from '../../utils/storage';
import { formatCurrency, formatDate } from '../../utils/calculations';

const InstallmentManager = ({ saleId, onClose }) => {
  const [installments, setInstallments] = useState([]);

  useEffect(() => {
    loadInstallments();
  }, [saleId]);

  const loadInstallments = () => {
    const data = getInstallmentsBySaleId(saleId);
    setInstallments(data);
  };

  const handleStatusChange = (installmentId, newStatus) => {
    const installment = installments.find(i => i.id === installmentId);
    const updatedData = {
      ...installment,
      status: newStatus,
      paymentDate: newStatus === 'Recebida' ? new Date().toISOString().split('T')[0] : ''
    };
    updateInstallment(installmentId, updatedData);
    loadInstallments();
  };

  const handleDueDateChange = (installmentId, dueDate) => {
    const installment = installments.find(i => i.id === installmentId);
    updateInstallment(installmentId, { ...installment, dueDate });
    loadInstallments();
  };

  const getStatusBadge = (status) => {
    const styles = {
      'Pendente': 'bg-yellow-100 text-yellow-800',
      'Recebida': 'bg-green-100 text-green-800',
      'Atrasada': 'bg-red-100 text-red-800'
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  const receivedCount = installments.filter(i => i.status === 'Recebida').length;
  const totalCount = installments.length;
  const totalReceived = installments
    .filter(i => i.status === 'Recebida')
    .reduce((sum, i) => sum + i.value, 0);
  const totalPending = installments
    .filter(i => i.status !== 'Recebida')
    .reduce((sum, i) => sum + i.value, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">
            Gerenciar Parcelas - Venda {saleId}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-sm text-blue-600 font-medium">Progresso</div>
              <div className="text-2xl font-bold text-blue-800 mt-1">
                {receivedCount} / {totalCount}
              </div>
              <div className="text-xs text-blue-600 mt-1">parcelas recebidas</div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-sm text-green-600 font-medium">Total Recebido</div>
              <div className="text-2xl font-bold text-green-800 mt-1">
                {formatCurrency(totalReceived)}
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="text-sm text-yellow-600 font-medium">Total Pendente</div>
              <div className="text-2xl font-bold text-yellow-800 mt-1">
                {formatCurrency(totalPending)}
              </div>
            </div>
          </div>

          {/* Lista de Parcelas */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-800">Parcelas</h3>
            {installments.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Nenhuma parcela encontrada</p>
            ) : (
              installments.map((installment) => (
                <div
                  key={installment.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
                    {/* Informações da Parcela */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="text-lg font-bold text-gray-800">
                          Parcela {installment.installmentNumber}/{installment.totalInstallments}
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(installment.status)}`}>
                          {installment.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        ID: {installment.id}
                      </div>
                      <div className="text-xl font-semibold text-blue-600 mt-2">
                        {formatCurrency(installment.value)}
                      </div>
                    </div>

                    {/* Data de Vencimento */}
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Data de Vencimento
                      </label>
                      <input
                        type="date"
                        value={installment.dueDate || ''}
                        onChange={(e) => handleDueDateChange(installment.id, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      {installment.dueDate && (
                        <p className="text-xs text-gray-500 mt-1">
                          Vence em: {formatDate(installment.dueDate)}
                        </p>
                      )}
                    </div>

                    {/* Ações */}
                    <div className="flex flex-col space-y-2">
                      {installment.status === 'Pendente' ? (
                        <button
                          onClick={() => handleStatusChange(installment.id, 'Recebida')}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium text-sm"
                        >
                          Marcar como Recebida
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => handleStatusChange(installment.id, 'Pendente')}
                            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium text-sm"
                          >
                            Marcar como Pendente
                          </button>
                          {installment.paymentDate && (
                            <p className="text-xs text-green-600 text-center">
                              Recebida em: {formatDate(installment.paymentDate)}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Barra de Progresso */}
          {totalCount > 0 && (
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progresso do Pagamento</span>
                <span>{((receivedCount / totalCount) * 100).toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-green-600 h-4 rounded-full transition-all duration-300"
                  style={{ width: `${(receivedCount / totalCount) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Botão Fechar */}
          <div className="flex justify-end pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstallmentManager;
