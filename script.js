// Datos de ejemplo
let wishlistItems = [
  {
    id: "1",
    name: "Hu Tao",
    type: "character",
    rarity: 5,
    imageUrl: "https://i.pinimg.com/736x/d5/0b/0d/d50b0da989d60aa7b9a7a9c6ca308365.jpg",
    notes: "77th-Generation Director of the Wangsheng Funeral Parlor",
    obtained: false,
    priority: 1,
  },
  {
    id: "2",
    name: "Staff of Homa",
    type: "weapon",
    rarity: 5,
    imageUrl: "https://i.pinimg.com/736x/12/a8/d4/12a8d4d31d3bffcab1a48887b4c5666d.jpg",
    notes: "Hu Tao's signature weapon",
    obtained: false,
    priority: 2,
  },
  {
    id: "3",
    name: "Bennett",
    type: "character",
    rarity: 4,
    imageUrl: "https://i.pinimg.com/1200x/3e/aa/9d/3eaa9d90e2e50775039f7ef0b7db6813.jpg",
    notes: "Leader of Benny's Adventure Team",
    obtained: true,
    priority: 3,
  }
];

let currentFilter = 'all';
let draggedElement = null;

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, initializing app...');
  initializeApp();
});

function initializeApp() {
  loadFromLocalStorage();
  renderWishlist();
  setupEventListeners();
  setupDragAndDrop();
  console.log('App initialized successfully');
}

// Configurar event listeners - CORREGIDO
function setupEventListeners() {
  // Filtros - usando data-filter attributes
  document.querySelectorAll('.btn-filter').forEach(btn => {
    btn.addEventListener('click', function() {
      // Remover clase active de todos los botones
      document.querySelectorAll('.btn-filter').forEach(b => b.classList.remove('active'));
      // Agregar clase active al botón clickeado
      this.classList.add('active');
      
      // Obtener el filtro del data-attribute
      currentFilter = this.dataset.filter;
      renderWishlist();
    });
  });

  // Botón agregar item - CORREGIDO con ID específico
  const addButton = document.getElementById('addButton');
  if (addButton) {
    addButton.addEventListener('click', function() {
      showAddModal();
    });
  }

  // Modal - CORREGIDO
  setupModalEvents();
}

// Modal functionality - CORREGIDO
function setupModalEvents() {
  const modal = document.getElementById('addModal');
  const form = document.getElementById('addForm');
  const cancelBtn = document.getElementById('cancelButton');
  
  // Botón cancelar - usando ID específico
  if (cancelBtn) {
    cancelBtn.addEventListener('click', hideAddModal);
  }
  
  // Cerrar modal al hacer click fuera
  if (modal) {
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        hideAddModal();
      }
    });
  }
  
  // Manejar envío del formulario - CORREGIDO con validación
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const formData = new FormData(form);
      const itemData = {
        name: formData.get('name').trim(),
        type: formData.get('type'),
        rarity: parseInt(formData.get('rarity')),
        imageUrl: formData.get('imageUrl').trim(),
        notes: formData.get('notes').trim()
      };
      
      // Validación mejorada
      if (itemData.name && itemData.type && itemData.rarity) {
        addItem(itemData);
        hideAddModal();
        form.reset();
      } else {
        alert('Please fill in all required fields (Name, Type, Rarity)');
      }
    });
  }
}

// Renderizar lista de wishlist - MEJORADO
function renderWishlist() {
  const container = document.getElementById('wishlistContainer');
  const filteredItems = getFilteredItems();
  
  if (!container) {
    console.error('Wishlist container not found');
    return;
  }
  
  container.innerHTML = '';
  
  if (filteredItems.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="text-align: center; padding: 3rem 0;">
        <h3 style="font-size: 1.25rem; margin-bottom: 0.5rem; color: var(--foreground);">
          ${currentFilter === 'all' ? 'Your wishlist is empty' : 'No items in this category'}
        </h3>
        <p style="color: #64748b; margin-bottom: 1.5rem;">
          ${currentFilter === 'all' ? 'Add your first character or weapon to get started!' : 'Try selecting a different filter or add new items.'}
        </p>
        ${currentFilter === 'all' ? '<button class="btn-primary" onclick="showAddModal()">Add your first item</button>' : ''}
      </div>
    `;
    return;
  }

  filteredItems.forEach(item => {
    const itemElement = createWishlistItemElement(item);
    container.appendChild(itemElement);
  });
}

function getFilteredItems() {
  return wishlistItems
    .filter(item => {
      switch (currentFilter) {
        case 'character-4':
          return item.type === 'character' && item.rarity === 4;
        case 'character-5':
          return item.type === 'character' && item.rarity === 5;
        case 'weapon-4':
          return item.type === 'weapon' && item.rarity === 4;
        case 'weapon-5':
          return item.type === 'weapon' && item.rarity === 5;
        default:
          return true;
      }
    })
    .sort((a, b) => a.priority - b.priority);
}

function createWishlistItemElement(item) {
  const div = document.createElement('div');
  div.className = `wishlist-item${item.obtained ? ' obtained' : ''}`;
  div.draggable = true;
  div.dataset.id = item.id;
  
  const stars = '★'.repeat(item.rarity);
  const typeIcon = item.type === 'character' ? '👤' : '⚔️';
  
  // Imagen con fallback mejorado
  const imageHtml = item.imageUrl ? 
    `<img src="${item.imageUrl}" alt="${item.name}" class="item-image" onerror="this.style.display='none'" />` : 
    `<div class="item-image" style="display: flex; align-items: center; justify-content: center; font-size: 1.5rem;">${typeIcon}</div>`;
  
  div.innerHTML = `
    <div class="drag-handle">⋮⋮</div>
    ${imageHtml}
    <div class="item-content">
      <h3 class="item-name${item.obtained ? ' obtained' : ''}">${item.name}</h3>
      <div class="item-meta">
        <span class="item-type">${typeIcon} ${item.type}</span>
        <div class="item-rarity">${stars}</div>
      </div>
      <p class="item-notes">${item.notes || 'No notes added'}</p>
      <div class="item-actions">
        <label class="checkbox-label">
          <input type="checkbox" ${item.obtained ? 'checked' : ''} 
                 onchange="toggleObtained('${item.id}', this.checked)" />
          Obtained
        </label>
        <button class="btn-delete" onclick="deleteItem('${item.id}')" title="Delete item">🗑️</button>
      </div>
    </div>
  `;
  
  return div;
}

// Funciones de manipulación de datos - CORREGIDAS
function toggleObtained(id, obtained) {
  const item = wishlistItems.find(item => item.id === id);
  if (item) {
    item.obtained = obtained;
    renderWishlist();
    saveToLocalStorage();
  }
}

function deleteItem(id) {
  const item = wishlistItems.find(item => item.id === id);
  const itemName = item ? item.name : 'this item';
  
  if (confirm(`Are you sure you want to delete "${itemName}" from your wishlist?`)) {
    wishlistItems = wishlistItems.filter(item => item.id !== id);
    // Reajustar prioridades
    wishlistItems.forEach((item, index) => {
      item.priority = index + 1;
    });
    renderWishlist();
    saveToLocalStorage();
  }
}

function addItem(itemData) {
  const newItem = {
    id: Date.now().toString(),
    ...itemData,
    obtained: false,
    priority: wishlistItems.length + 1
  };
  
  wishlistItems.push(newItem);
  renderWishlist();
  saveToLocalStorage();
}

// Drag and Drop functionality - MEJORADO
function setupDragAndDrop() {
  document.addEventListener('dragstart', handleDragStart);
  document.addEventListener('dragend', handleDragEnd);
  document.addEventListener('dragover', handleDragOver);
  document.addEventListener('drop', handleDrop);
}

function handleDragStart(e) {
  if (e.target.classList.contains('wishlist-item')) {
    draggedElement = e.target;
    e.target.classList.add('dragging');
    e.target.style.opacity = '0.5';
    e.dataTransfer.effectAllowed = 'move';
  }
}

function handleDragEnd(e) {
  if (e.target.classList.contains('wishlist-item')) {
    e.target.classList.remove('dragging');
    e.target.style.opacity = '';
    draggedElement = null;
  }
}

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
}

function handleDrop(e) {
  e.preventDefault();
  
  const item = e.target.closest('.wishlist-item');
  if (item && draggedElement && item !== draggedElement) {
    const draggedId = draggedElement.dataset.id;
    const targetId = item.dataset.id;
    reorderItems(draggedId, targetId);
    saveToLocalStorage();
  }
}

function reorderItems(draggedId, targetId) {
  const draggedIndex = wishlistItems.findIndex(item => item.id === draggedId);
  const targetIndex = wishlistItems.findIndex(item => item.id === targetId);
  
  if (draggedIndex === -1 || targetIndex === -1) return;
  
  // Mover el elemento
  const [movedItem] = wishlistItems.splice(draggedIndex, 1);
  wishlistItems.splice(targetIndex, 0, movedItem);
  
  // Actualizar prioridades
  wishlistItems.forEach((item, index) => {
    item.priority = index + 1;
  });
  
  renderWishlist();
}

// Modal functions - CORREGIDAS
function showAddModal() {
  const modal = document.getElementById('addModal');
  if (modal) {
    modal.classList.add('show');
    // Focus en el primer input
    const firstInput = modal.querySelector('input[name="name"]');
    if (firstInput) {
      setTimeout(() => firstInput.focus(), 100);
    }
  }
}

function hideAddModal() {
  const modal = document.getElementById('addModal');
  if (modal) {
    modal.classList.remove('show');
  }
}

// Persistencia local - MEJORADA
function saveToLocalStorage() {
  try {
    localStorage.setItem('wishlistItems', JSON.stringify(wishlistItems));
    console.log('Data saved to localStorage');
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

function loadFromLocalStorage() {
  try {
    const saved = localStorage.getItem('wishlistItems');
    if (saved) {
      const parsedItems = JSON.parse(saved);
      if (Array.isArray(parsedItems) && parsedItems.length > 0) {
        wishlistItems = parsedItems;
        console.log('Data loaded from localStorage');
      }
    }
  } catch (error) {
    console.error('Error loading from localStorage:', error);
  }
}

// Auto-guardar cambios - SIMPLIFICADO
function autoSave() {
  const originalRender = renderWishlist;
  renderWishlist = function() {
    originalRender();
    saveToLocalStorage();
  };
}

// Inicializar auto-save
autoSave();

// Cerrar modal con tecla Escape
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    hideAddModal();
  }
});

// Función útil para agregar personajes desde consola
function addSampleCharacter(name, type = 'character', rarity = 5, notes = '') {
  const newItem = {
    id: Date.now().toString(),
    name: name,
    type: type,
    rarity: rarity,
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop',
    notes: notes,
    obtained: false,
    priority: wishlistItems.length + 1
  };
  
  wishlistItems.push(newItem);
  renderWishlist();
  saveToLocalStorage();
  console.log(`Added ${name} to wishlist`);
}

console.log('Gaming Wishlist script loaded successfully');