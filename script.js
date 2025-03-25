/* Configuração do CSV */
const CONFIG = {
  CSV_FILE: 'produtos.csv'
};

let cart = JSON.parse(localStorage.getItem('cart')) || [];
let products = [];
let modalProductIndex = null; // Armazena o índice do produto exibido no modal

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
    document.getElementById('product-pages').innerHTML = `<p>Erro: ${error.message}</p>`;
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
  
  // 12 produtos por página
  const productsPerPage = 12;
  const totalPages = Math.ceil(productsData.length / productsPerPage);
  
  for (let i = 0; i < totalPages; i++) {
    const pageDiv = document.createElement('div');
    pageDiv.className = 'print-page';
    
    // Cabeçalho da página
    const headerDiv = document.createElement('div');
    headerDiv.className = 'page-header';
    pageDiv.appendChild(headerDiv);
    
    // Área de conteúdo para produtos
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
          <!-- Botão com ícone do carrinho -->
          <button onclick="openAddToCartModal(${start+index})">
            <img src="icon-cart.png" alt="Carrinho" style="width:20px; vertical-align:middle;">
          </button>
        </div>
      `;
      gridDiv.appendChild(cardDiv);
    });
    
    contentDiv.appendChild(gridDiv);
    pageDiv.appendChild(contentDiv);
    
    // Rodapé da página
    const footerDiv = document.createElement('div');
    footerDiv.className = 'page-footer';
    pageDiv.appendChild(footerDiv);
    
    container.appendChild(pageDiv);
  }
}

/**
 * Abre o modal para adicionar o produto ao carrinho, solicitando a quantidade.
 */
function openAddToCartModal(productIndex) {
  modalProductIndex = productIndex;
  const product = products[productIndex];
  
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
  }
}

function updateCart() {
  const cartCountElem = document.getElementById('cart-count');
  const cartItemsElem = document.getElementById('cart-items');
  cartCountElem.textContent = cart.length;
  
  if (cart.length === 0) {
    cartItemsElem.innerHTML = `<p>Carrinho vazio!</p>`;
  } else {
    cartItemsElem.innerHTML = cart.map((item, index) => {
      const totalItem = item.quantity * item.valor;
      return `
        <div class="cart-item">
          <span>${item.nome} - R$ ${item.valor.toFixed(2)}</span>
          <br>
          <label>Qtd:</label>
          <input type="number" value="${item.quantity}" min="1" onchange="updateCartItem(${index}, this.value)">
          <span>= R$ ${totalItem.toFixed(2)}</span>
          <button onclick="removeFromCart(${index})">Remover</button>
        </div>
      `;
    }).join('') + `<button onclick="clearCart()">Limpar Carrinho</button>`;
  }
}

function updateCartItem(index, newQty) {
  const qty = parseInt(newQty);
  if (qty < 1) return;
  cart[index].quantity = qty;
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
