// Teste de validação dos cálculos de IR
// Para executar: node test-ir-calculation.js

// Simular as funções de cálculo
const calculateMonthlyIR = (monthlyRevenue) => {
  // ETAPA 1: Base de cálculo (dedução simplificada de 20%)
  const calculationBase = monthlyRevenue * 0.80;

  // ETAPA 2: Aplicar tabela progressiva
  const IR_TAX_BRACKETS_2025 = [
    { max: 2259.20, rate: 0, deduction: 0 },
    { max: 2826.65, rate: 0.075, deduction: 169.44 },
    { max: 4664.68, rate: 0.15, deduction: 381.44 },
    { max: 5839.45, rate: 0.225, deduction: 662.77 },
    { max: Infinity, rate: 0.275, deduction: 896.00 }
  ];

  let irDue = 0;
  let appliedRate = 0;

  for (const bracket of IR_TAX_BRACKETS_2025) {
    if (calculationBase <= bracket.max) {
      irDue = (calculationBase * bracket.rate) - bracket.deduction;
      appliedRate = bracket.rate;
      break;
    }
  }

  // Garantir que IR não seja negativo
  irDue = Math.max(0, irDue);

  // Calcular alíquota efetiva
  const effectiveRate = monthlyRevenue > 0 ? (irDue / monthlyRevenue) * 100 : 0;

  return {
    monthlyRevenue: Math.round(monthlyRevenue * 100) / 100,
    calculationBase: Math.round(calculationBase * 100) / 100,
    irDue: Math.round(irDue * 100) / 100,
    appliedRate: appliedRate * 100,
    effectiveRate: Math.round(effectiveRate * 100) / 100
  };
};

// Testes de validação
const tests = [
  { revenue: 3000, expectedBase: 2400, expectedIR: 10.56 },
  { revenue: 5000, expectedBase: 4000, expectedIR: 218.56 },
  { revenue: 11400, expectedBase: 9120, expectedIR: 1612.00 }
];

console.log('='.repeat(80));
console.log('TESTE DE VALIDAÇÃO - CÁLCULO DE IMPOSTO DE RENDA');
console.log('='.repeat(80));
console.log('');

let allTestsPassed = true;

tests.forEach((test, index) => {
  const result = calculateMonthlyIR(test.revenue);

  console.log(`Teste ${index + 1}:`);
  console.log(`  Faturamento: R$ ${test.revenue.toFixed(2)}`);
  console.log(`  Base Esperada: R$ ${test.expectedBase.toFixed(2)}`);
  console.log(`  Base Calculada: R$ ${result.calculationBase.toFixed(2)}`);
  console.log(`  IR Esperado: R$ ${test.expectedIR.toFixed(2)}`);
  console.log(`  IR Calculado: R$ ${result.irDue.toFixed(2)}`);

  const baseCorrect = Math.abs(result.calculationBase - test.expectedBase) < 0.01;
  const irCorrect = Math.abs(result.irDue - test.expectedIR) < 0.01;

  if (baseCorrect && irCorrect) {
    console.log(`  ✅ PASSOU`);
  } else {
    console.log(`  ❌ FALHOU`);
    if (!baseCorrect) {
      console.log(`     - Base incorreta (diferença: ${(result.calculationBase - test.expectedBase).toFixed(2)})`);
    }
    if (!irCorrect) {
      console.log(`     - IR incorreto (diferença: ${(result.irDue - test.expectedIR).toFixed(2)})`);
    }
    allTestsPassed = false;
  }
  console.log('');
});

console.log('='.repeat(80));
if (allTestsPassed) {
  console.log('✅ TODOS OS TESTES PASSARAM!');
} else {
  console.log('❌ ALGUNS TESTES FALHARAM!');
}
console.log('='.repeat(80));
