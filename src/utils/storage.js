// Funções para gerenciar localStorage

const STORAGE_KEYS = {
  PRODUCTS: 'perfume_products',
  CLIENTS: 'perfume_clients',
  SALES: 'perfume_sales',
  INSTALLMENTS: 'perfume_installments'
};

// Produtos
export const getProducts = () => {
  const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
  return data ? JSON.parse(data) : [];
};

export const saveProducts = (products) => {
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
};

export const addProduct = (product) => {
  const products = getProducts();
  products.push(product);
  saveProducts(products);
  return product;
};

export const updateProduct = (id, updatedProduct) => {
  const products = getProducts();
  const index = products.findIndex(p => p.id === id);
  if (index !== -1) {
    products[index] = { ...products[index], ...updatedProduct };
    saveProducts(products);
    return products[index];
  }
  return null;
};

export const deleteProduct = (id) => {
  const products = getProducts();
  const filtered = products.filter(p => p.id !== id);
  saveProducts(filtered);
};

// Clientes
export const getClients = () => {
  const data = localStorage.getItem(STORAGE_KEYS.CLIENTS);
  return data ? JSON.parse(data) : [];
};

export const saveClients = (clients) => {
  localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
};

export const addClient = (client) => {
  const clients = getClients();
  clients.push(client);
  saveClients(clients);
  return client;
};

export const updateClient = (id, updatedClient) => {
  const clients = getClients();
  const index = clients.findIndex(c => c.id === id);
  if (index !== -1) {
    clients[index] = { ...clients[index], ...updatedClient };
    saveClients(clients);
    return clients[index];
  }
  return null;
};

export const deleteClient = (id) => {
  const clients = getClients();
  const filtered = clients.filter(c => c.id !== id);
  saveClients(filtered);
};

// Vendas
export const getSales = () => {
  const data = localStorage.getItem(STORAGE_KEYS.SALES);
  return data ? JSON.parse(data) : [];
};

export const saveSales = (sales) => {
  localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));
};

export const addSale = (sale) => {
  const sales = getSales();
  sales.push(sale);
  saveSales(sales);
  return sale;
};

export const updateSale = (id, updatedSale) => {
  const sales = getSales();
  const index = sales.findIndex(s => s.id === id);
  if (index !== -1) {
    sales[index] = { ...sales[index], ...updatedSale };
    saveSales(sales);
    return sales[index];
  }
  return null;
};

export const deleteSale = (id) => {
  const sales = getSales();
  const filtered = sales.filter(s => s.id !== id);
  saveSales(filtered);
};

// Parcelas
export const getInstallments = () => {
  const data = localStorage.getItem(STORAGE_KEYS.INSTALLMENTS);
  return data ? JSON.parse(data) : [];
};

export const saveInstallments = (installments) => {
  localStorage.setItem(STORAGE_KEYS.INSTALLMENTS, JSON.stringify(installments));
};

export const addInstallments = (installments) => {
  const allInstallments = getInstallments();
  allInstallments.push(...installments);
  saveInstallments(allInstallments);
  return installments;
};

export const updateInstallment = (id, updatedInstallment) => {
  const installments = getInstallments();
  const index = installments.findIndex(i => i.id === id);
  if (index !== -1) {
    installments[index] = { ...installments[index], ...updatedInstallment };
    saveInstallments(installments);
    return installments[index];
  }
  return null;
};

export const getInstallmentsBySaleId = (saleId) => {
  const installments = getInstallments();
  return installments.filter(i => i.saleId === saleId);
};

// Gerar IDs
export const generateId = (prefix, items) => {
  if (items.length === 0) return `${prefix}001`;

  const numbers = items.map(item => {
    const num = item.id.replace(prefix, '');
    return parseInt(num, 10);
  });

  const maxNum = Math.max(...numbers);
  const nextNum = maxNum + 1;
  return `${prefix}${String(nextNum).padStart(3, '0')}`;
};
