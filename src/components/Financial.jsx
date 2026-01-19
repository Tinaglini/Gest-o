import React, { useState, useEffect } from 'react';
import { getSales } from '../utils/storage';
import {
  formatCurrency,
  calculateMonthlyIR,
  calculateIRWithRealCosts,
  calculateAnnualIRProjection,
  IR_TAX_BRACKETS_2025
} from '../utils/calculations';

const Financial = () => {
  const [monthlyRevenue, setMonthlyRevenue] = useState('');
  const [realCosts, setRealCosts] = useState('');
  const [useRealCosts, setUseRealCosts] = useState(false);
  const [irResults, setIrResults] = useState(null);
  const [autoCalculateFromSales, setAutoCalculateFromSales] = useState(false);

  useEffect(() => {
    if (autoCalculateFromSales) {
      calculateFromSales();
    }
  }, [autoCalculateFromSales]);

  const calculateFromSales = () => {
    const sales = getSales();

    // Pegar vendas dos últimos 30 dias
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentSales = sales.filter(sale => new Date(sale.date) >= thirtyDaysAgo);

    // Calcular faturamento mensal (total pago pelos clientes)
    const revenue = recentSales.reduce((sum, sale) => sum + sale.totalValue, 0);

    // Calcular custos reais (soma dos custos dos produtos + taxas + frete)
    const costs = recentSales.reduce((sum, sale) => {
      // Custo do produto (baseado no netProfit e valores da venda)
      // netProfit = totalValue - custoProduto - taxa
      // Então: custoProduto = totalValue - netProfit - taxa
      const productCost = sale.totalValue - sale.netProfit - (sale.fee || 0);
      return sum + productCost;
    }, 0);

    setMonthlyRevenue(revenue.toFixed(2));
    setRealCosts(costs.toFixed(2));
    setUseRealCosts(true);
    handleCalculate(revenue, costs);
  };

  const handleCalculate = (revenue = null, costs = null) => {
    const revenueValue = revenue !== null ? revenue : parseFloat(monthlyRevenue) || 0;
    const costsValue = costs !== null ? costs : parseFloat(realCosts) || 0;

    if (revenueValue <= 0) {
      setIrResults(null);
      return;
    }

    let results;
    if (useRealCosts && costsValue > 0) {
      results = calculateIRWithRealCosts(revenueValue, costsValue);
    } else {
      results = calculateMonthlyIR(revenueValue);
    }

    const annualProjection = calculateAnnualIRProjection(revenueValue);
    results.annualProjection = annualProjection;

    setIrResults(results);
  };

  const getBracketInfo = (calculationBase) => {
    for (let i = 0; i < IR_TAX_BRACKETS_2025.length; i++) {
      const bracket = IR_TAX_BRACKETS_2025[i];
      if (calculationBase <= bracket.max) {
        return {
          bracketNumber: i + 1,
          rate: bracket.rate * 100,
          deduction: bracket.deduction,
          isExempt: bracket.rate === 0
        };
      }
    }
    return null;
  };

  const getExampleResults = () => {
    return [
      { revenue: 3000, base: 2400, ir: 10.56 },
      { revenue: 5000, base: 4000, ir: 218.56 },
      { revenue: 11400, base: 9120, ir: 1612.00 }
    ];
  };

  const bracketInfo = irResults ? getBracketInfo(irResults.calculationBase) : null;

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Cálculo de Imposto de Renda</h1>
        <p className="text-gray-600 mt-1">Carnê-Leão - Dedução Simplificada (20%)</p>
      </div>

      {/* Opção de calcular automaticamente */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="autoCalc"
            checked={autoCalculateFromSales}
            onChange={(e) => setAutoCalculateFromSales(e.target.checked)}
            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
          />
          <label htmlFor="autoCalc" className="text-sm font-medium text-blue-900 cursor-pointer">
            Calcular automaticamente com base nas vendas dos últimos 30 dias
          </label>
        </div>
      </div>

      {/* Formulário de Entrada */}
      <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
        <h2 className="text-xl font-bold text-gray-800">Dados para Cálculo</h2>

        {/* Faturamento Mensal */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Faturamento Mensal (R$) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={monthlyRevenue}
            onChange={(e) => setMonthlyRevenue(e.target.value)}
            step="0.01"
            min="0"
            placeholder="Ex: 5000.00"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-lg"
            disabled={autoCalculateFromSales}
          />
        </div>

        {/* Opção de usar custos reais */}
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="useRealCosts"
            checked={useRealCosts}
            onChange={(e) => setUseRealCosts(e.target.checked)}
            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
            disabled={autoCalculateFromSales}
          />
          <label htmlFor="useRealCosts" className="text-sm font-medium text-gray-700 cursor-pointer">
            Usar custos reais para métricas adicionais
          </label>
        </div>

        {/* Custos Reais (opcional) */}
        {useRealCosts && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custos Reais Mensais (R$)
            </label>
            <input
              type="number"
              value={realCosts}
              onChange={(e) => setRealCosts(e.target.value)}
              step="0.01"
              min="0"
              placeholder="Ex: 2000.00"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-lg"
              disabled={autoCalculateFromSales}
            />
            <p className="text-xs text-gray-500 mt-1">
              Inclui custos de produtos, frete, e outras despesas operacionais
            </p>
          </div>
        )}

        {/* Botão Calcular */}
        {!autoCalculateFromSales && (
          <button
            onClick={() => handleCalculate()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg text-lg"
          >
            Calcular IR
          </button>
        )}
      </div>

      {/* Resultados */}
      {irResults && (
        <div className="space-y-6">
          {/* Cards Principais */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg">
              <div className="text-sm font-medium text-blue-100">Faturamento Mensal</div>
              <div className="text-3xl font-bold mt-2">{formatCurrency(irResults.monthlyRevenue)}</div>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-lg shadow-lg">
              <div className="text-sm font-medium text-orange-100">Base de Cálculo (80%)</div>
              <div className="text-3xl font-bold mt-2">{formatCurrency(irResults.calculationBase)}</div>
              <div className="text-xs text-orange-100 mt-1">
                Dedução: {formatCurrency(irResults.simplifiedDeduction)}
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-6 rounded-lg shadow-lg">
              <div className="text-sm font-medium text-red-100">IR Devido (Mensal)</div>
              <div className="text-3xl font-bold mt-2">{formatCurrency(irResults.irDue)}</div>
              <div className="text-xs text-red-100 mt-1">
                Alíquota Efetiva: {irResults.effectiveRate.toFixed(2)}%
              </div>
            </div>
          </div>

          {/* Comparação de Lucro - COM e SEM IR */}
          {irResults.realCosts !== undefined && (
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-300 rounded-lg p-6">
              <h3 className="text-xl font-bold text-purple-900 mb-4 text-center">
                💰 Comparação: Lucro COM e SEM IR Descontado
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Lucro SEM IR */}
                <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-green-400">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700">Lucro SEM IR Descontado</span>
                    <span className="text-2xl">✅</span>
                  </div>
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {formatCurrency(irResults.realProfit)}
                  </div>
                  <div className="text-xs text-gray-600 space-y-1 mt-3 pt-3 border-t border-gray-200">
                    <p>Faturamento: {formatCurrency(irResults.monthlyRevenue)}</p>
                    <p>Custos: {formatCurrency(irResults.realCosts)}</p>
                    <p className="font-semibold text-green-700">= Lucro Bruto</p>
                  </div>
                </div>

                {/* Lucro COM IR */}
                <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-blue-400">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700">Lucro COM IR Descontado</span>
                    <span className="text-2xl">💵</span>
                  </div>
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {formatCurrency(irResults.profitAfterIR)}
                  </div>
                  <div className="text-xs text-gray-600 space-y-1 mt-3 pt-3 border-t border-gray-200">
                    <p>Lucro Bruto: {formatCurrency(irResults.realProfit)}</p>
                    <p className="text-red-600">IR Mensal: {formatCurrency(irResults.irDue)}</p>
                    <p className="font-semibold text-blue-700">= Lucro Líquido</p>
                  </div>
                </div>
              </div>

              {/* Impacto do IR */}
              <div className="mt-4 bg-yellow-100 border border-yellow-300 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-yellow-900">Impacto do IR no Lucro</p>
                    <p className="text-xs text-yellow-800 mt-1">
                      O IR representa {irResults.irPercentageOnProfit.toFixed(2)}% do seu lucro real mensal
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-red-600">
                      -{formatCurrency(irResults.irDue)}
                    </p>
                    <p className="text-xs text-gray-600">por mês</p>
                  </div>
                </div>
              </div>

              {/* Projeção Anual do Impacto */}
              <div className="mt-3 bg-gray-100 border border-gray-300 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Impacto Anual do IR</p>
                    <p className="text-xs text-gray-700 mt-1">
                      Projeção do IR que você pagará no ano todo
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-red-700">
                      -{formatCurrency(irResults.annualProjection.annualIRDue)}
                    </p>
                    <p className="text-xs text-gray-600">no ano</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Informações da Faixa */}
          {bracketInfo && (
            <div className={`rounded-lg p-4 ${
              bracketInfo.isExempt ? 'bg-green-50 border border-green-200' : 'bg-purple-50 border border-purple-200'
            }`}>
              <h3 className={`font-semibold mb-2 ${
                bracketInfo.isExempt ? 'text-green-800' : 'text-purple-800'
              }`}>
                {bracketInfo.isExempt ? '✅ Isento de IR' : `Faixa ${bracketInfo.bracketNumber} da Tabela Progressiva`}
              </h3>
              {!bracketInfo.isExempt && (
                <div className="text-sm space-y-1">
                  <p className="text-gray-700">
                    <strong>Alíquota:</strong> {bracketInfo.rate}%
                  </p>
                  <p className="text-gray-700">
                    <strong>Dedução:</strong> {formatCurrency(bracketInfo.deduction)}
                  </p>
                  <p className="text-gray-600 text-xs mt-2">
                    Cálculo: ({formatCurrency(irResults.calculationBase)} × {bracketInfo.rate}%) - {formatCurrency(bracketInfo.deduction)} = {formatCurrency(irResults.irDue)}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Projeção Anual */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Projeção Anual</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="text-sm text-gray-600">Faturamento Anual Projetado</div>
                <div className="text-2xl font-bold text-blue-600 mt-1">
                  {formatCurrency(irResults.annualProjection.annualRevenue)}
                </div>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="text-sm text-gray-600">IR Anual Projetado</div>
                <div className="text-2xl font-bold text-red-600 mt-1">
                  {formatCurrency(irResults.annualProjection.annualIRDue)}
                </div>
              </div>
            </div>
          </div>

          {/* Tabela de Faixas */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Tabela Progressiva 2025</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Faixa</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Base de Cálculo</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Alíquota</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dedução</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {IR_TAX_BRACKETS_2025.map((bracket, index) => {
                    const isCurrentBracket = irResults &&
                      irResults.calculationBase <= bracket.max &&
                      (index === 0 || irResults.calculationBase > IR_TAX_BRACKETS_2025[index - 1].max);

                    return (
                      <tr key={index} className={isCurrentBracket ? 'bg-blue-50 font-semibold' : ''}>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {isCurrentBracket && '→ '}Faixa {index + 1}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {index === 0 ? 'Até ' : 'De '}
                          {index > 0 && formatCurrency(IR_TAX_BRACKETS_2025[index - 1].max) + ' a '}
                          {bracket.max === Infinity ? 'acima' : formatCurrency(bracket.max)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {bracket.rate === 0 ? 'Isento' : `${(bracket.rate * 100).toFixed(2)}%`}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {bracket.deduction === 0 ? '-' : formatCurrency(bracket.deduction)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Exemplos de Validação */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Exemplos de Validação</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Faturamento</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Base (80%)</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">IR Devido</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ação</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {getExampleResults().map((example, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(example.revenue)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{formatCurrency(example.base)}</td>
                  <td className="px-4 py-3 text-sm font-medium text-red-600">{formatCurrency(example.ir)}</td>
                  <td className="px-4 py-3 text-sm">
                    <button
                      onClick={() => {
                        setMonthlyRevenue(example.revenue.toString());
                        setUseRealCosts(false);
                        setAutoCalculateFromSales(false);
                        handleCalculate(example.revenue);
                      }}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Testar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Informações Importantes */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-yellow-800 mb-3">ℹ️ Informações Importantes</h3>
        <ul className="space-y-2 text-sm text-yellow-900">
          <li>• Este cálculo usa a <strong>dedução simplificada de 20%</strong> (carnê-leão)</li>
          <li>• A tabela progressiva é de <strong>2025</strong></li>
          <li>• O IR deve ser pago até o <strong>último dia útil do mês seguinte</strong></li>
          <li>• Use o <strong>DARF código 0190</strong> para pagamento</li>
          <li>• Consulte um contador para situações específicas</li>
        </ul>
      </div>
    </div>
  );
};

export default Financial;
