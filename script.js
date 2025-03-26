/* Configuração do CSV */
const CONFIG = {
  CSV_FILE: 'produtos.csv'
};

let cart = JSON.parse(localStorage.getItem('cart')) || [];
let products = [];
let modalProductIndex = null; // Índice do produto para o modal

document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
  updateCart();
});

async function loadProducts() {
  try {
    const response = await fetch(CONFIG.CSV_FILE);
    if (!response.ok) throw new Error(`Erro ao carregar arquivo: ${response.statusText}`);
    const text = await response.text();
    products = parseCSV(text);
    displayProductPages(products);
  } catch (error) {
    console.error('Erro ao carregar produtos:', error);
    // Fallback para dados dummy (para testes locais)
    products = [
      { id: '1', nome: 'Produto 1', referencia: 'REF001', descricao: 'Descrição do produto 1', valor: 10.0, imagem: 'placeholder.jpg', categoria: 'Categoria A' },
      { id: '2', nome: 'Produto 2', referencia: 'REF002', descricao: 'Descrição do produto 2', valor: 20.0, imagem: 'placeholder.jpg', categoria: 'Categoria B' },
      { id: '3', nome: 'Produto 3', referencia: 'REF003', descricao: 'Descrição do produto 3', valor: 30.0, imagem: 'placeholder.jpg', categoria: 'Categoria A' },
      // Adicione mais produtos se necessário
    ];
    displayProductPages(products);
  }
}

function parseCSV(csvText) {
  const rows = csvText.trim().split('\n');
  rows.shift(); // Remove o cabeçalho do CSV
  return rows.map(row => {
    const cols = row.split(',');
    let rawValue = cols[4]?.replace(/"/g, '').trim() || '0';
    const valorNumerico = parseFloat(rawValue) || 0.0;
    return {
      id: cols[0]?.trim(),
      nome: cols[1]?.trim() || 'Sem Nome',
      referencia: cols[2]?.trim(),
      descricao: cols[3]?.trim(),
      valor: valorNumerico,
      imagem: cols[5]?.trim() || 'placeholder.jpg',
      categoria: cols[6]?.trim() || 'Sem Categoria'
    };
  });
}

function displayProductPages(productsData) {
  const container = document.getElementById('product-pages');
  container.innerHTML = '';
  
  // 9 produtos por página
  const productsPerPage = 9;
  const totalPages = Math.ceil(productsData.length / productsPerPage);
  
  for (let i = 0; i < totalPages; i++) {
    const pageDiv = document.createElement('div');
    pageDiv.className = 'print-page';
    
    // Cabeçalho
    const headerDiv = document.createElement('div');
    headerDiv.className = 'page-header';
    pageDiv.appendChild(headerDiv);
    
    // Área de conteúdo
    const contentDiv = document.createElement('div');
    contentDiv.className = 'page-content';
    const gridDiv = document.createElement('div');
    gridDiv.className = 'product-grid-page';
    
    const start = i * productsPerPage;
    const end = start + productsPerPage;
    const pageProducts = productsData.slice(start, end);
    
    pageProducts.forEach((product, index) => {
      const cardDiv = document.createElement('div');
      cardDiv.className = 'product-card';
      cardDiv.innerHTML = `
        <img
          src="images/${product.imagem}"
          alt="${product.nome}"
          onerror="this.src='images/placeholder.jpg'"
          class="product-img"
        >
        <h3 class="product-name">${product.nome}</h3>
        <p class="product-ref">Ref: ${product.referencia}</p>
        <p class="product-desc">${product.descricao}</p>
        <p class="product-price">R$ ${product.valor.toFixed(2)}</p>
        <div class="product-actions">
          <button onclick="openAddToCartModal(${start+index})" title="Adicionar">
            &#43;
          </button>
        </div>
      `;
      gridDiv.appendChild(cardDiv);
    });
    
    contentDiv.appendChild(gridDiv);
    pageDiv.appendChild(contentDiv);
    
    // Rodapé
    const footerDiv = document.createElement('div');
    footerDiv.className = 'page-footer';
    pageDiv.appendChild(footerDiv);
    
    container.appendChild(pageDiv);
  }
}

/* Carrinho e demais funções... (mesmo que antes) */
