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

function openAddToCartModal(productIndex) {
  modalProductIndex = productIndex;
  const product = products[productIndex];
  
  if (!product) {
    console.error("Produto não encontrado para o índice:", productIndex);
    return;
  }
  
  const modalBody = document.getElementById('modal-body');
  modalBody.innerHTML = `
    <h2>${product.nome}</h2>
    <p><strong>Ref:</strong> ${product.referencia}</p>
    <p><strong>Preço:</strong> R$ ${product.valor.toFixed(2)}</p>
    <div class="modal-actions">
      <label for="modal-qty">Quantidade:</label>
      <input type="number" id="modal-qty" value="1" min="1">
      <button onclick="addToCartFromModal()">Adicionar</button>
    </div>
  `;
  
  document.getElementById('product-modal').style.display = 'block';
}

function addToCartFromModal() {
  const qtyInput = document.getElementById('modal-qty');
  const qty = parseInt(qtyInput.value) || 1;
  addToCart(modalProductIndex, qty);
  closeModal();
}

function closeModal() {
  document.getElementById('product-modal').style.display = 'none';
}

function addToCart(productIndex, quantity) {
  console.log("Adicionando ao carrinho:", productIndex, quantity);
  const qty = parseInt(quantity) || 1;
  const product = products[productIndex];
  if (product) {
    const index = cart.findIndex(item => item.id === product.id);
    if (index >= 0) {
      cart[index].quantity += qty;
    } else {
      const productWithQty = { ...product, quantity: qty };
      cart.push(productWithQty);
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCart();
  } else {
    console.error("Produto não encontrado para index:", productIndex);
  }
}

function updateCart() {
  const cartCountElem = document.getElementById('cart-count');
  const cartItemsElem = document.getElementById('cart-items');
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCountElem.textContent = totalItems;
  
  if (cart.length === 0) {
    cartItemsElem.innerHTML = `<p class="empty-cart">Seu carrinho está vazio.</p>`;
  } else {
    cartItemsElem.innerHTML = cart.map((item, index) => {
      const totalItem = item.quantity * item.valor;
      return `
        <div class="cart-item">
          <img src="images/${item.imagem}" alt="${item.nome}" class="cart-item-img" onerror="this.src='images/placeholder.jpg'">
          <div class="cart-item-info">
            <h4 class="cart-item-name">${item.nome}</h4>
            <p class="cart-item-price">R$ ${item.valor.toFixed(2)}</p>
            <div class="cart-item-controls">
              <button onclick="decreaseQty(${index})" class="qty-btn">–</button>
              <input type="number" value="${item.quantity}" min="1" onchange="updateCartItem(${index}, this.value)">
              <button onclick="increaseQty(${index})" class="qty-btn">+</button>
            </div>
          </div>
          <button onclick="removeFromCart(${index})" class="remove-btn">&times;</button>
        </div>
      `;
    }).join('') + `
      <div class="cart-summary">
        <h3>Total: R$ ${cart.reduce((sum, item) => sum + item.quantity * item.valor, 0).toFixed(2)}</h3>
        <button onclick="clearCart()" class="clear-cart-btn">Limpar Carrinho</button>
        <button onclick="sendWhatsApp()" class="checkout-btn">Enviar Orçamento via WhatsApp</button>
      </div>
    `;
  }
}

function updateCartItem(index, newQty) {
  const qty = parseInt(newQty);
  if (qty < 1) return;
  cart[index].quantity = qty;
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCart();
}

function decreaseQty(index) {
  if (cart[index].quantity > 1) {
    cart[index].quantity--;
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCart();
  }
}

function increaseQty(index) {
  cart[index].quantity++;
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCart();
}

function clearCart() {
  if (confirm('Deseja limpar o carrinho?')) {
    cart = [];
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCart();
  }
}

function removeFromCart(index) {
  cart.splice(index, 1);
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCart();
}

function toggleCart() {
  const panel = document.getElementById('cart-panel');
  panel.style.display = (panel.style.display === 'block') ? 'none' : 'block';
}

function sendWhatsApp() {
  if (cart.length === 0) {
    alert('Carrinho vazio!');
    return;
  }
  const total = cart.reduce((sum, item) => sum + (item.valor * item.quantity), 0);
  const message = `*Orçamento Solicitado*:\n\n` +
    cart.map(item => `➤ ${item.nome} - ${item.quantity} x R$ ${item.valor.toFixed(2)}`).join('\n') +
    `\n\n*Total: R$ ${total.toFixed(2)}*`;
  window.open(`https://wa.me/?text=${encodeURIComponent(message)}`);
}
