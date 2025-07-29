/**
 * StudioERP - Sistema de gestão para cabeleireiros autônomos
 * 
 * Funcionalidades:
 * - Dashboard com gráficos
 * - Lista de serviços
 * - Gestão de clientes
 * - Controle de estoque
 * - Persistência com localStorage
 * - Totalmente responsivo
 */

// =============================================
// 1. Sistema de Dados e Persistência
// =============================================

const DB = {
  /**
   * Obtém dados do localStorage
   * @param {string} key - Chave de identificação
   * @returns {any} Dados armazenados ou null
   */
  get(key) {
    const data = localStorage.getItem(`studioERP_${key}`);
    return data ? JSON.parse(data) : null;
  },

  /**
   * Armazena dados no localStorage
   * @param {string} key - Chave de identificação
   * @param {any} data - Dados a serem armazenados
   */
  set(key, data) {
    localStorage.setItem(`studioERP_${key}`, JSON.stringify(data));
  },

  /**
   * Inicializa dados padrão se não existirem
   */
  init() {
    if (!this.get('services')) {
      this.set('services', [
        { id: 1, name: 'Corte', count: 45, color: '#16a34a', price: 60, icon: '✂️' },
        { id: 2, name: 'Coloração', count: 28, color: '#ea580c', price: 120, icon: '🎨' },
        { id: 3, name: 'Hidratação', count: 32, color: '#2563eb', price: 80, icon: '🧴' }
      ]);
    }

    if (!this.get('clients')) {
      this.set('clients', [
        {
          id: 1,
          name: 'Ana Silva',
          phone: '(11) 98765-4321',
          email: 'ana@exemplo.com',
          hairType: 'Cacheado',
          allergies: ['Amônia'],
          lastVisit: '2023-07-15',
          totalVisits: 5
        },
        {
          id: 2,
          name: 'Carlos Oliveira',
          phone: '(11) 91234-5678',
          email: 'carlos@exemplo.com',
          hairType: 'Liso',
          allergies: [],
          lastVisit: '2023-07-10',
          totalVisits: 3
        }
      ]);
    }

    if (!this.get('inventory')) {
      this.set('inventory', [
        { id: 1, name: 'Shampoo Hidratante', quantity: 3, min: 5, price: 25.90 },
        { id: 2, name: 'Tonalizante Violeta', quantity: 7, min: 3, price: 42.50 },
        { id: 3, name: 'Máscara de Reconstrução', quantity: 2, min: 4, price: 68.00 }
      ]);
    }
  }
};

// Inicializar banco de dados
DB.init();

// =============================================
// 2. Sistema de Navegação
// =============================================
/**
 * Carrega a navegação principal
 */
function loadNavigation() {
  const navLinks = [
    { title: 'Dashboard', icon: '📊', id: 'dashboard' },
    { title: 'Serviços', icon: '✂️', id: 'services' },  // Added Services menu item
    { title: 'Clientes', icon: '👥', id: 'clients' },
    { title: 'Estoque', icon: '📦', id: 'inventory' },
    { title: 'Relatórios', icon: '📈', id: 'reports' },
    { title: 'Configurações', icon: '⚙️', id: 'settings' }
  ];

  const navContainer = document.getElementById('navLinks');
  const mobileNavContainer = document.getElementById('mobileNavLinks');

  if (navContainer) {
    navContainer.innerHTML = navLinks.map(link => `
      <a href="#" data-page="${link.id}" class="flex items-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
        <span class="mr-3">${link.icon}</span>
        <span>${link.title}</span>
      </a>
    `).join('');
  }

  if (mobileNavContainer) {
    mobileNavContainer.innerHTML = navLinks.map(link => `
      <a href="#" data-page="${link.id}" class="flex items-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
        <span class="mr-3">${link.icon}</span>
        <span>${link.title}</span>
      </a>
    `).join('');
  }

  // Event listeners para navegação
  document.querySelectorAll('#navLinks a, #mobileNavLinks a').forEach(link => {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      const page = this.getAttribute('data-page');
      loadPage(page);

      // Atualizar classe ativa
      document.querySelectorAll('#navLinks a, #mobileNavLinks a').forEach(a => {
        a.classList.remove('bg-purple-100', 'dark:bg-gray-700', 'text-purple-600', 'dark:text-purple-300');
      });
      this.classList.add('bg-purple-100', 'dark:bg-gray-700', 'text-purple-600', 'dark:text-purple-300');
    });
  });

  // Ativar dashboard por padrão
  const defaultLink = document.querySelector('#navLinks a[data-page="dashboard"]');
  if (defaultLink) {
    defaultLink.classList.add('bg-purple-100', 'dark:bg-gray-700', 'text-purple-600', 'dark:text-purple-300');
  }
}

/**
 * Carrega uma página específica
 * @param {string} page - Nome da página a ser carregada
 */
function loadPage(page) {
  document.getElementById('pageTitle').textContent =
    page.charAt(0).toUpperCase() + page.slice(1);

  switch (page) {
    case 'dashboard':
      loadDashboard();
      break;
    case 'services':
      loadServices(); // This will load the services page
      break;
    case 'clients':
      loadClients();
      break;
    case 'inventory':
      loadInventory();
      break;
    case 'reports':
      loadReports();
      break;
    case 'settings':
      loadSettings();
      break;
    default:
      document.getElementById('mainContent').innerHTML = `
        <div class="bg-white p-6 rounded-lg shadow animate-fadeIn">
          <h3 class="text-lg font-semibold">${page.charAt(0).toUpperCase() + page.slice(1)}</h3>
          <p class="mt-2 text-gray-600">Conteúdo em desenvolvimento</p>
        </div>
      `;
  }
}

// =============================================
// 3. Páginas Principais
// =============================================

/**
 * Carrega o dashboard principal
 */
function loadDashboard() {
  const services = DB.get('services');
  const clients = DB.get('clients');
  const inventory = DB.get('inventory');

  const content = `
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 animate-fadeIn">
      <!-- Card: Total de Clientes -->
      <div class="bg-white p-6 rounded-lg shadow card">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <div>
            <h3 class="font-semibold text-gray-500">Total de Clientes</h3>
            <p class="text-3xl font-bold text-gray-800">${clients.length}</p>
          </div>
        </div>
      </div>
      
      <!-- Card: Serviços (30 dias) -->
      <div class="bg-white p-6 rounded-lg shadow card">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-green-100 text-green-600 mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div>
            <h3 class="font-semibold text-gray-500">Serviços (30 dias)</h3>
            <p class="text-3xl font-bold text-gray-800">${services.reduce((a, b) => a + b.count, 0)}</p>
          </div>
        </div>
      </div>
      
      <!-- Card: Estoque Baixo -->
      <div class="bg-white p-6 rounded-lg shadow card">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-red-100 text-red-600 mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h3 class="font-semibold text-gray-500">Estoque Baixo</h3>
            <p class="text-3xl font-bold text-gray-800">${inventory.filter(i => i.quantity < i.min).length}</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Gráficos -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slideUp">
      <!-- Gráfico de Serviços -->
      <div class="bg-white p-6 rounded-lg shadow">
        <h3 class="font-semibold mb-4">Serviços Mais Realizados</h3>
        <div class="chart-container">
          <canvas id="servicesChart"></canvas>
        </div>
      </div>
      
      <!-- Gráfico de Faturamento -->
      <div class="bg-white p-6 rounded-lg shadow">
        <h3 class="font-semibold mb-4">Faturamento Mensal</h3>
        <div class="chart-container">
          <canvas id="revenueChart"></canvas>
        </div>
      </div>
    </div>
    
    <!-- Clientes Recentes -->
    <div class="bg-white p-6 rounded-lg shadow mt-6 animate-slideUp">
      <div class="flex justify-between items-center mb-4">
        <h3 class="font-semibold text-lg">Clientes Recentes</h3>
        <button onclick="loadClients()" class="text-purple-600 hover:text-purple-800 text-sm font-medium">
          Ver todos →
        </button>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        ${clients.slice(0, 3).map(client => `
          <div class="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div class="flex items-center">
              <div class="bg-purple-100 text-purple-800 rounded-full w-10 h-10 flex items-center justify-center mr-3">
                ${client.name.charAt(0)}
              </div>
              <div>
                <p class="font-medium">${client.name}</p>
                <p class="text-sm text-gray-500">Última visita: ${formatDate(client.lastVisit)}</p>
              </div>
            </div>
            <div class="mt-3 pt-3 border-t flex justify-between items-center">
              <span class="text-xs bg-gray-100 px-2 py-1 rounded">${client.hairType || 'Não informado'}</span>
              <button onclick="renderClientForm(${client.id})" class="text-xs text-purple-600 hover:text-purple-800">
                Editar
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  document.getElementById('mainContent').innerHTML = content;
  renderCharts();
}

/**
 * Carrega a página de clientes
 */

/**
* Carrega a página de serviços
*/
function loadServices() {
  const services = DB.get('services');

  const content = `
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden animate-fadeIn">
      <div class="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h3 class="font-semibold text-lg text-gray-800 dark:text-white">Gestão de Serviços</h3>
        <div class="flex space-x-2 w-full md:w-auto">
          <input type="text" id="serviceSearch" placeholder="Buscar serviço..." 
                 class="form-input flex-1 md:w-64 px-4 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400">
          <button onclick="renderServiceForm()" 
                  class="hidden md:flex items-center bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 whitespace-nowrap transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
            </svg>
            Novo Serviço
          </button>
        </div>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6" id="servicesGrid">
        ${services.map(service => `
          <div class="service-card bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-all hover:shadow-lg">
            <div class="w-12 h-12 rounded-full ${service.color ? '' : 'bg-purple-100 dark:bg-purple-900'} flex items-center justify-center ${service.color ? '' : 'text-purple-600 dark:text-purple-300'} mb-4 text-xl" ${service.color ? `style="background-color: ${service.color}"` : ''}>
              ${service.icon || '✂️'}
            </div>
            <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-1">${service.name}</h3>
            <p class="text-purple-600 dark:text-purple-400 font-medium mb-2">R$ ${service.price.toFixed(2)}</p>
            <p class="text-sm text-gray-600 dark:text-gray-400">Realizados: ${service.count}</p>
            <div class="flex space-x-2 mt-4">
              <button onclick="renderServiceForm(${service.id})" class="text-xs bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded">
                Editar
              </button>
              <button onclick="deleteService(${service.id})" class="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded">
                Excluir
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
    
    <!-- Botão flutuante para mobile -->
    <div class="md:hidden fixed bottom-6 right-6 z-40">
      <button onclick="renderServiceForm()" aria-label="Adicionar serviço"
              class="bg-primary-600 text-white p-4 rounded-full shadow-lg hover:bg-primary-700 transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
        </svg>
      </button>
    </div>
  `;

  document.getElementById('mainContent').innerHTML = content;

  // Adicionar busca em tempo real
  document.getElementById('serviceSearch')?.addEventListener('input', function (e) {
    const searchTerm = e.target.value.toLowerCase();
    const cards = document.querySelectorAll('#servicesGrid .service-card');

    cards.forEach(card => {
      const name = card.querySelector('h3').textContent.toLowerCase();
      card.style.display = name.includes(searchTerm) ? '' : 'none';
    });
  });
}

/**
 * Renderiza o formulário de serviço
 */
function renderServiceForm(serviceId = null) {
  const services = DB.get('services');
  const service = serviceId ? services.find(s => s.id == serviceId) : null;
  const isEdit = service !== null;

  const formHTML = `
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 max-w-3xl mx-auto animate-fadeIn">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-lg font-semibold">${isEdit ? 'Editar' : 'Novo'} Serviço</h3>
        <button onclick="loadServices()" class="text-gray-500 hover:text-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <form id="serviceForm" class="space-y-6">
        <input type="hidden" name="id" value="${isEdit ? service.id : ''}">
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Nome -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome *</label>
            <input type="text" name="name" value="${isEdit ? escapeHtml(service.name) : ''}" required
                   class="form-input w-full px-4 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
          </div>
          
          <!-- Preço -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Preço (R$) *</label>
            <input type="number" name="price" min="0" step="0.01" value="${isEdit ? service.price.toFixed(2) : ''}" required
                   class="form-input w-full px-4 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
          </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Ícone -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ícone</label>
            <input type="text" name="icon" value="${isEdit ? escapeHtml(service.icon || '') : ''}" placeholder="Ex: ✂️, 💇, 🧴"
                   class="form-input w-full px-4 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
          </div>
          
          <!-- Cor -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cor (hexadecimal)</label>
            <input type="color" name="color" value="${isEdit ? service.color || '#7c3aed' : '#7c3aed'}"
                   class="form-input w-full h-10 px-1 py-1 border rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600">
          </div>
        </div>
        
        <!-- Descrição -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descrição</label>
          <textarea name="description" rows="3"
                    class="form-input w-full px-4 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">${isEdit ? escapeHtml(service.description || '') : ''}</textarea>
        </div>
        
        <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button type="button" onclick="loadServices()" class="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white px-6 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
            Cancelar
          </button>
          <button type="submit" class="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors">
            ${isEdit ? 'Atualizar' : 'Salvar'} Serviço
          </button>
        </div>
      </form>
    </div>
  `;

  document.getElementById('mainContent').innerHTML = formHTML;

  // Configurar envio do formulário
  document.getElementById('serviceForm').addEventListener('submit', function (e) {
    e.preventDefault();
    saveService(this);
  });
}

/**
 * Salva os dados do serviço (cria ou atualiza)
 */
function saveService(form) {
  const formData = new FormData(form);
  let services = DB.get('services') || []; // Garante que services seja um array
  
  const serviceData = {
    id: formData.get('id') ? parseInt(formData.get('id')) : Date.now(),
    name: formData.get('name'),
    price: parseFloat(formData.get('price')),
    icon: formData.get('icon') || '✂️', // Valor padrão se não informado
    color: formData.get('color') || '#7c3aed', // Valor padrão se não informado
    description: formData.get('description') || '',
    count: formData.get('id') ? 
           (services.find(s => s.id === parseInt(formData.get('id')))?.count || 0 
           : 0
  };

  if (formData.get('id')) {
    // Atualizar serviço existente
    const index = services.findIndex(s => s.id === parseInt(formData.get('id')));
    if (index !== -1) {
      services[index] = serviceData;
    }
  } else {
    // Adicionar novo serviço
    services.push(serviceData);
  }

  DB.set('services', services);
  showAlert('success', `Serviço ${formData.get('id') ? 'atualizado' : 'cadastrado'} com sucesso!`);
  loadServices();
}
/**
 * Exclui um serviço
 */
function deleteService(serviceId) {
  if (confirm('Tem certeza que deseja excluir este serviço?')) {
    const services = DB.get('services').filter(s => s.id != serviceId);
    DB.set('services', services);
    showAlert('success', 'Serviço excluído com sucesso!');
    loadServices();
  }
}

function showToast(message, type = "success") {
  const icons = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
    warning: '⚠️'
  };

  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    warning: 'bg-yellow-500'
  };

  const toast = document.createElement('div');
  toast.className = `fixed bottom-4 right-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg flex items-center animate-slideUp z-50`;
  toast.innerHTML = `
    <span class="mr-2 text-xl">${icons[type]}</span>
    <span>${message}</span>
  `;
  
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('animate-fadeOut');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
/**
 * Carrega a página de clientes
 */
function loadClients() {
  const clients = DB.get('clients');

  const content = `
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden animate-fadeIn">
      <div class="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h3 class="font-semibold text-lg text-gray-800 dark:text-white">Lista de Clientes</h3>
        <div class="flex space-x-2 w-full md:w-auto">
          <input type="text" id="clientSearch" placeholder="Buscar cliente..." 
                 class="form-input flex-1 md:w-64 px-4 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400">
          <!-- Botão para desktop -->
          <button onclick="renderClientForm()" 
                  class="hidden md:flex items-center bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 whitespace-nowrap transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
            </svg>
            Novo Cliente
          </button>
        </div>
      </div>
      
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Cliente</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Contato</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Última Visita</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Visitas</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700" id="clientsTableBody">
            ${clients.map(client => `
              <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td class="px-4 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <span class="inline-flex items-center justify-center h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200 font-medium mr-3">
                      ${client.name.charAt(0)}
                    </span>
                    <div>
                      <div class="font-medium text-gray-900 dark:text-white">${client.name}</div>
                      <div class="text-sm text-gray-500 dark:text-gray-400">${client.hairType || 'Não informado'}</div>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900 dark:text-white">${client.phone || '—'}</div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">${client.email || '—'}</div>
                </td>
                <td class="px-4 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                  <div class="flex items-center">
                    ${formatDate(client.lastVisit)}
                    ${new Date(client.lastVisit) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) ?
      '<span class="ml-2 w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>' : ''}
                  </div>
                </td>
                <td class="px-4 py-4 whitespace-nowrap">
                  <span class="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">${client.totalVisits}</span>
                </td>
                <td class="px-4 py-4 whitespace-nowrap text-sm font-medium">
                  <div class="flex space-x-2">
                    <button onclick="renderClientForm(${client.id})" class="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 p-1 rounded hover:bg-primary-50 dark:hover:bg-gray-700">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                      </svg>
                    </button>
                    <button onclick="deleteClient(${client.id})" class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1 rounded hover:bg-red-50 dark:hover:bg-gray-700">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- Botão flutuante para mobile -->
    <div class="md:hidden fixed bottom-6 right-6 z-40">
      <button onclick="renderClientForm()" aria-label="Adicionar cliente"
              class="bg-primary-600 text-white p-4 rounded-full shadow-lg hover:bg-primary-700 transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
        </svg>
      </button>
    </div>
  `;

  document.getElementById('mainContent').innerHTML = content;

  // Adicionar busca em tempo real
  document.getElementById('clientSearch').addEventListener('input', function (e) {
    const searchTerm = e.target.value.toLowerCase();
    const rows = document.querySelectorAll('#clientsTableBody tr');

    rows.forEach(row => {
      const name = row.querySelector('td:first-child div.font-medium').textContent.toLowerCase();
      row.style.display = name.includes(searchTerm) ? '' : 'none';
    });
  });
}
/**
 * Carrega a página de estoque
 */
/**
 * Carrega a página de estoque
 */
function loadInventory() {
  const inventory = DB.get('inventory');
  const lowStock = inventory.filter(i => i.quantity < i.min);

  const content = `
    ${lowStock.length > 0 ? `
      <div class="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-400 p-4 mb-6 animate-pulse">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-500 dark:text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-red-700 dark:text-red-200">
              Você tem ${lowStock.length} produto(s) com estoque abaixo do mínimo recomendado.
            </p>
          </div>
        </div>
      </div>
    ` : ''}
    
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div class="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h3 class="font-semibold text-lg text-gray-800 dark:text-white">Gestão de Estoque</h3>
        <div class="flex space-x-2 w-full md:w-auto">
          <input type="text" id="inventorySearch" placeholder="Buscar produto..." 
                 class="form-input flex-1 md:w-64 px-4 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400">
          <!-- Botão para desktop -->
          <button onclick="renderProductForm()" 
                  class="hidden md:flex items-center bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 whitespace-nowrap transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
            </svg>
            Adicionar Produto
          </button>
        </div>
      </div>
      
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Produto</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Quantidade</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Mínimo</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Preço</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700" id="inventoryTableBody">
            ${inventory.map(item => `
              <tr class="${item.quantity < item.min ? 'bg-red-50 dark:bg-red-900/10' : ''} hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td class="px-4 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-white">
                  <div class="flex items-center">
                    <span class="inline-flex items-center justify-center h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-600 mr-3">
                      <span class="text-sm font-medium text-gray-700 dark:text-gray-300">${item.name.charAt(0)}</span>
                    </span>
                    ${item.name}
                  </div>
                </td>
                <td class="px-4 py-4 whitespace-nowrap">
                  <input type="number" value="${item.quantity}" min="0"
                         onchange="updateInventoryQuantity(${item.id}, this.value)"
                         class="w-20 px-2 py-1 border rounded focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                </td>
                <td class="px-4 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">${item.min}</td>
                <td class="px-4 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">R$ ${item.price.toFixed(2)}</td>
                <td class="px-4 py-4 whitespace-nowrap">
                  ${item.quantity < item.min
      ? '<span class="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200 flex items-center justify-center w-16"><svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/></svg> Baixo</span>'
      : '<span class="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200 flex items-center justify-center w-12"><svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg> OK</span>'}
                </td>
                <td class="px-4 py-4 whitespace-nowrap text-sm font-medium">
                  <div class="flex space-x-2">
                    <button onclick="renderProductForm(${item.id})" class="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 p-1 rounded hover:bg-primary-50 dark:hover:bg-gray-700">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                      </svg>
                    </button>
                    <button onclick="deleteProduct(${item.id})" class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1 rounded hover:bg-red-50 dark:hover:bg-gray-700">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- Botão flutuante para mobile -->
    <div class="md:hidden fixed bottom-6 right-6 z-40">
      <button onclick="renderProductForm()" aria-label="Adicionar produto"
              class="bg-primary-600 text-white p-4 rounded-full shadow-lg hover:bg-primary-700 transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
        </svg>
      </button>
    </div>
  `;

  document.getElementById('mainContent').innerHTML = content;

  // Adicionar busca em tempo real
  document.getElementById('inventorySearch').addEventListener('input', function (e) {
    const searchTerm = e.target.value.toLowerCase();
    const rows = document.querySelectorAll('#inventoryTableBody tr');

    rows.forEach(row => {
      const name = row.querySelector('td:first-child').textContent.toLowerCase();
      row.style.display = name.includes(searchTerm) ? '' : 'none';
    });
  });
}

/**
 * Carrega a página de relatórios
 */
function loadReports() {
  const content = `
    <div class="grid grid-cols-1 gap-6">
      <!-- Gráfico de Faturamento Anual -->
      <div class="bg-white p-6 rounded-lg shadow animate-fadeIn">
        <h3 class="font-semibold mb-4">Faturamento Anual</h3>
        <div class="chart-container">
          <canvas id="annualRevenueChart"></canvas>
        </div>
      </div>
      
      <!-- Gráfico de Tipos de Cliente -->
      <div class="bg-white p-6 rounded-lg shadow animate-slideUp">
        <h3 class="font-semibold mb-4">Perfil de Clientes</h3>
        <div class="chart-container">
          <canvas id="clientTypeChart"></canvas>
        </div>
      </div>
      
      <!-- Relatório de Serviços -->
      <div class="bg-white p-6 rounded-lg shadow animate-slideUp">
        <div class="flex justify-between items-center mb-4">
          <h3 class="font-semibold">Relatório de Serviços</h3>
          <button onclick="exportToExcel()" class="text-sm bg-green-100 text-green-800 px-3 py-1 rounded hover:bg-green-200">
            Exportar para Excel
          </button>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Serviço</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantidade</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Faturamento</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">% do Total</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              ${generateServicesReport()}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  document.getElementById('mainContent').innerHTML = content;
  renderReportsCharts();
}

// =============================================
// 4. Formulários e CRUD
// =============================================

/**
 * Renderiza o formulário de cliente
 * @param {number|null} clientId - ID do cliente para edição ou null para novo
 */
function renderClientForm(clientId = null) {
  const clients = DB.get('clients');
  const client = clientId ? clients.find(c => c.id == clientId) : null;
  const isEdit = client !== null;

  const formHTML = `
    <div class="bg-white rounded-lg shadow p-6 max-w-3xl mx-auto animate-fadeIn">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-lg font-semibold">${isEdit ? 'Editar' : 'Novo'} Cliente</h3>
        <button onclick="loadClients()" class="text-gray-500 hover:text-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <form id="clientForm" class="space-y-6">
        <input type="hidden" name="id" value="${isEdit ? client.id : ''}">
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Nome -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
            <input type="text" name="name" value="${isEdit ? escapeHtml(client.name) : ''}" required
                   class="form-input w-full px-4 py-2 border rounded-lg focus:ring-purple-500 focus:border-purple-500">
          </div>
          
          <!-- Telefone -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
            <input type="tel" name="phone" value="${isEdit ? escapeHtml(client.phone || '') : ''}"
                   class="form-input w-full px-4 py-2 border rounded-lg focus:ring-purple-500 focus:border-purple-500">
          </div>
        </div>
        
        <!-- Email -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
          <input type="email" name="email" value="${isEdit ? escapeHtml(client.email || '') : ''}"
                 class="form-input w-full px-4 py-2 border rounded-lg focus:ring-purple-500 focus:border-purple-500">
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Tipo de Cabelo -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de Cabelo</label>
            <select name="hairType" class="form-input w-full px-4 py-2 border rounded-lg focus:ring-purple-500 focus:border-purple-500">
              <option value="">Selecione...</option>
              <option value="Liso" ${isEdit && client.hairType === 'Liso' ? 'selected' : ''}>Liso</option>
              <option value="Ondulado" ${isEdit && client.hairType === 'Ondulado' ? 'selected' : ''}>Ondulado</option>
              <option value="Cacheado" ${isEdit && client.hairType === 'Cacheado' ? 'selected' : ''}>Cacheado</option>
              <option value="Crespo" ${isEdit && client.hairType === 'Crespo' ? 'selected' : ''}>Crespo</option>
            </select>
          </div>
          
          <!-- Última Visita -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Última Visita</label>
            <input type="date" name="lastVisit" value="${isEdit ? client.lastVisit : new Date().toISOString().split('T')[0]}"
                   class="form-input w-full px-4 py-2 border rounded-lg focus:ring-purple-500 focus:border-purple-500">
          </div>
        </div>
        
        <!-- Alergias -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Alergias</label>
          <input type="text" name="allergies" 
                 value="${isEdit && client.allergies ? escapeHtml(client.allergies.join(', ')) : ''}"
                 placeholder="Separe por vírgulas (ex: Amônia, Parabenos)"
                 class="form-input w-full px-4 py-2 border rounded-lg focus:ring-purple-500 focus:border-purple-500">
        </div>
        
        <!-- Observações -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Observações</label>
          <textarea name="notes" rows="3"
                    class="form-input w-full px-4 py-2 border rounded-lg focus:ring-purple-500 focus:border-purple-500">${isEdit ? escapeHtml(client.notes || '') : ''}</textarea>
        </div>
        
        <div class="flex justify-end space-x-3 pt-4 border-t">
          <button type="button" onclick="loadClients()" class="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors">
            Cancelar
          </button>
          <button type="submit" class="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors">
            ${isEdit ? 'Atualizar' : 'Salvar'} Cliente
          </button>
        </div>
      </form>
    </div>
  `;

  document.getElementById('mainContent').innerHTML = formHTML;

  // Configurar envio do formulário
  document.getElementById('clientForm').addEventListener('submit', function (e) {
    e.preventDefault();
    saveClient(this);
  });
}

/**
 * Salva os dados do cliente (cria ou atualiza)
 * @param {HTMLFormElement} form - Formulário com os dados do cliente
 */
function saveClient(form) {
  const formData = new FormData(form);
  const clients = DB.get('clients');

  const clientData = {
    id: formData.get('id') ? parseInt(formData.get('id')) : Date.now(),
    name: formData.get('name'),
    phone: formData.get('phone'),
    email: formData.get('email'),
    hairType: formData.get('hairType'),
    allergies: formData.get('allergies') ?
      formData.get('allergies').split(',').map(a => a.trim()) : [],
    lastVisit: formData.get('lastVisit'),
    notes: formData.get('notes'),
    totalVisits: formData.get('id') ?
      clients.find(c => c.id == formData.get('id')).totalVisits : 1
  };

  if (formData.get('id')) {
    // Atualizar cliente existente
    const index = clients.findIndex(c => c.id == formData.get('id'));
    if (index !== -1) {
      clients[index] = clientData;
    }
  } else {
    // Adicionar novo cliente
    clients.push(clientData);
  }

  DB.set('clients', clients);
  showAlert('success', `Cliente ${formData.get('id') ? 'atualizado' : 'cadastrado'} com sucesso!`);
  loadClients();
}

/**
 * Exclui um cliente
 * @param {number} clientId - ID do cliente a ser excluído
 */
function deleteClient(clientId) {
  if (confirm('Tem certeza que deseja excluir este cliente?')) {
    const clients = DB.get('clients').filter(c => c.id != clientId);
    DB.set('clients', clients);
    showAlert('success', 'Cliente excluído com sucesso!');
    loadClients();
  }
}

/**
 * Renderiza o formulário de produto
 * @param {number|null} productId - ID do produto para edição ou null para novo
 */
function renderProductForm(productId = null) {
  const inventory = DB.get('inventory');
  const product = productId ? inventory.find(p => p.id == productId) : null;
  const isEdit = product !== null;

  const formHTML = `
    <div class="bg-white rounded-lg shadow p-6 max-w-3xl mx-auto animate-fadeIn">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-lg font-semibold">${isEdit ? 'Editar' : 'Novo'} Produto</h3>
        <button onclick="loadInventory()" class="text-gray-500 hover:text-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <form id="productForm" class="space-y-6">
        <input type="hidden" name="id" value="${isEdit ? product.id : ''}">
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Nome -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
            <input type="text" name="name" value="${isEdit ? escapeHtml(product.name) : ''}" required
                   class="form-input w-full px-4 py-2 border rounded-lg focus:ring-purple-500 focus:border-purple-500">
          </div>
          
          <!-- Quantidade -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Quantidade *</label>
            <input type="number" name="quantity" min="0" value="${isEdit ? product.quantity : '0'}" required
                   class="form-input w-full px-4 py-2 border rounded-lg focus:ring-purple-500 focus:border-purple-500">
          </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Quantidade Mínima -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Quantidade Mínima *</label>
            <input type="number" name="minQuantity" min="1" value="${isEdit ? product.min : '1'}" required
                   class="form-input w-full px-4 py-2 border rounded-lg focus:ring-purple-500 focus:border-purple-500">
          </div>
          
          <!-- Preço -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Preço (R$) *</label>
            <input type="number" name="price" min="0" step="0.01" value="${isEdit ? product.price.toFixed(2) : '0.00'}" required
                   class="form-input w-full px-4 py-2 border rounded-lg focus:ring-purple-500 focus:border-purple-500">
          </div>
        </div>
        
        <!-- Categoria -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
          <select name="category" class="form-input w-full px-4 py-2 border rounded-lg focus:ring-purple-500 focus:border-purple-500">
            <option value="">Selecione...</option>
            <option value="Shampoo" ${isEdit && product.category === 'Shampoo' ? 'selected' : ''}>Shampoo</option>
            <option value="Condicionador" ${isEdit && product.category === 'Condicionador' ? 'selected' : ''}>Condicionador</option>
            <option value="Tonalizante" ${isEdit && product.category === 'Tonalizante' ? 'selected' : ''}>Tonalizante</option>
            <option value="Máscara" ${isEdit && product.category === 'Máscara' ? 'selected' : ''}>Máscara</option>
            <option value="Outros" ${isEdit && product.category === 'Outros' ? 'selected' : ''}>Outros</option>
          </select>
        </div>
        
        <!-- Descrição -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
          <textarea name="description" rows="3"
                    class="form-input w-full px-4 py-2 border rounded-lg focus:ring-purple-500 focus:border-purple-500">${isEdit ? escapeHtml(product.description || '') : ''}</textarea>
        </div>
        
        <div class="flex justify-end space-x-3 pt-4 border-t">
          <button type="button" onclick="loadInventory()" class="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors">
            Cancelar
          </button>
          <button type="submit" class="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors">
            ${isEdit ? 'Atualizar' : 'Salvar'} Produto
          </button>
        </div>
      </form>
    </div>
  `;

  document.getElementById('mainContent').innerHTML = formHTML;

  // Configurar envio do formulário
  document.getElementById('productForm').addEventListener('submit', function (e) {
    e.preventDefault();
    saveProduct(this);
  });
}

/**
 * Salva os dados do produto (cria ou atualiza)
 * @param {HTMLFormElement} form - Formulário com os dados do produto
 */
function saveProduct(form) {
  const formData = new FormData(form);
  const inventory = DB.get('inventory');

  const productData = {
    id: formData.get('id') ? parseInt(formData.get('id')) : Date.now(),
    name: formData.get('name'),
    quantity: parseInt(formData.get('quantity')),
    min: parseInt(formData.get('minQuantity')),
    price: parseFloat(formData.get('price')),
    category: formData.get('category'),
    description: formData.get('description')
  };

  if (formData.get('id')) {
    // Atualizar produto existente
    const index = inventory.findIndex(p => p.id == formData.get('id'));
    if (index !== -1) {
      inventory[index] = productData;
    }
  } else {
    // Adicionar novo produto
    inventory.push(productData);
  }

  DB.set('inventory', inventory);
  showAlert('success', `Produto ${formData.get('id') ? 'atualizado' : 'cadastrado'} com sucesso!`);
  loadInventory();
}

/**
 * Atualiza a quantidade de um produto no estoque
 * @param {number} productId - ID do produto
 * @param {number} quantity - Nova quantidade
 */
function updateInventoryQuantity(productId, quantity) {
  const inventory = DB.get('inventory');
  const product = inventory.find(p => p.id == productId);

  if (product) {
    product.quantity = parseInt(quantity);
    DB.set('inventory', inventory);

    // Atualizar visualização
    const row = document.querySelector(`#inventoryTableBody tr[data-id="${productId}"]`);
    if (row) {
      row.classList.toggle('bg-red-50', product.quantity < product.min);
      row.classList.toggle('dark:bg-red-900/10', product.quantity < product.min);

      const statusCell = row.querySelector('td:nth-child(5)');
      if (statusCell) {
        statusCell.innerHTML = product.quantity < product.min
          ? '<span class="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200">Baixo</span>'
          : '<span class="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200">OK</span>';
      }
    }
  }
}

/**
 * Exclui um produto
 * @param {number} productId - ID do produto a ser excluído
 */
function deleteProduct(productId) {
  if (confirm('Tem certeza que deseja excluir este produto?')) {
    const inventory = DB.get('inventory').filter(p => p.id != productId);
    DB.set('inventory', inventory);
    showAlert('success', 'Produto excluído com sucesso!');
    loadInventory();
  }
}

// =============================================
// 5. Gráficos e Relatórios
// =============================================

/**
 * Renderiza os gráficos do dashboard
 */
/**
 * Renderiza os gráficos do dashboard
 */
function renderCharts() {
  const isDarkMode = document.documentElement.classList.contains('dark');
  const services = DB.get('services');

  // Configurações globais do Chart.js
  Chart.defaults.color = isDarkMode ? '#e2e8f0' : '#374151';
  Chart.defaults.borderColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

  // Gráfico de Serviços
  const servicesCtx = document.getElementById('servicesChart')?.getContext('2d');
  if (servicesCtx) {
    new Chart(servicesCtx, {
      type: 'bar',
      data: {
        labels: services.map(s => s.name),
        datasets: [{
          label: 'Serviços Realizados (últimos 30 dias)',
          data: services.map(s => s.count),
          backgroundColor: services.map(s => s.color),
          borderWidth: 1
        }]
      },
      options: getChartOptions(isDarkMode, {
        plugins: {
          legend: {
            display: false
          }
        }
      })
    });
  }

  // Gráfico de Faturamento
  const revenueCtx = document.getElementById('revenueChart')?.getContext('2d');
  if (revenueCtx) {
    // Dados de exemplo
    const monthlyData = [5200, 4800, 6100, 5300, 5900, 6300];
    const weeklyData = monthlyData.map(x => x / 4);
    const dailyData = monthlyData.map(x => x / 28);

    new Chart(revenueCtx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
        datasets: [
          {
            label: 'Mensal (R$)',
            data: monthlyData,
            borderColor: isDarkMode ? '#a78bfa' : '#7e22ce',
            backgroundColor: isDarkMode ? 'rgba(167, 139, 250, 0.1)' : 'rgba(126, 34, 206, 0.1)',
            fill: true,
            tension: 0.3,
            borderWidth: 3
          },
          {
            label: 'Semanal (R$)',
            data: weeklyData,
            borderColor: isDarkMode ? '#93c5fd' : '#3b82f6',
            backgroundColor: isDarkMode ? 'rgba(147, 197, 253, 0.1)' : 'rgba(59, 130, 246, 0.1)',
            tension: 0.3,
            borderWidth: 2,
            borderDash: [5, 3]
          },
          {
            label: 'Diário (R$)',
            data: dailyData,
            borderColor: isDarkMode ? '#6ee7b7' : '#10b981',
            backgroundColor: isDarkMode ? 'rgba(110, 231, 183, 0.1)' : 'rgba(16, 185, 129, 0.1)',
            tension: 0.3,
            borderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6
          }
        ]
      },
      options: getChartOptions(isDarkMode, {
        plugins: {
          legend: {
            position: 'top',
            labels: {
              usePointStyle: true,
              padding: 20
            }
          }
        }
      })
    });
  }
}

/**
 * Função auxiliar para opções padrão dos gráficos
 */
function getChartOptions(isDarkMode, customOptions = {}) {
  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
        titleColor: isDarkMode ? '#e2e8f0' : '#111827',
        bodyColor: isDarkMode ? '#e2e8f0' : '#111827',
        borderColor: isDarkMode ? '#334155' : '#e5e7eb',
        callbacks: {
          label: function (context) {
            return `${context.dataset.label}: ${context.raw.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            })}`;
          }
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: isDarkMode ? '#94a3b8' : '#6b7280'
        },
        grid: {
          color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
        }
      },
      y: {
        ticks: {
          color: isDarkMode ? '#94a3b8' : '#6b7280',
          callback: function (value) {
            return value.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            });
          }
        },
        grid: {
          color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
        },
        beginAtZero: true
      }
    }
  };

  return mergeOptions(baseOptions, customOptions);
}

/**
 * Função para mesclar opções de gráficos
 */
function mergeOptions(base, custom) {
  return {
    ...base,
    ...custom,
    plugins: {
      ...base.plugins,
      ...(custom.plugins || {})
    },
    scales: {
      ...base.scales,
      ...(custom.scales || {})
    }
  };
}

/**
 * Renderiza os gráficos de relatórios
 */
function renderReportsCharts() {
  // Gráfico de Faturamento Anual
  const annualCtx = document.getElementById('annualRevenueChart').getContext('2d');
  new Chart(annualCtx, {
    type: 'bar',
    data: {
      labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
      datasets: [
        {
          label: 'Faturamento',
          data: [3200, 4200, 3800, 4500, 5200, 4800, 5100, 4900, 5300, 5500, 5800, 6200],
          backgroundColor: '#7e22ce'
        },
        {
          label: 'Comissões',
          data: [960, 1260, 1140, 1350, 1560, 1440, 1530, 1470, 1590, 1650, 1740, 1860],
          backgroundColor: '#22d3ee'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Faturamento Anual vs Comissões'
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });

  // Gráfico de Tipos de Cliente
  const clientTypeCtx = document.getElementById('clientTypeChart').getContext('2d');
  new Chart(clientTypeCtx, {
    type: 'doughnut',
    data: {
      labels: ['Novos', 'Recorrentes', 'Ocasionais'],
      datasets: [{
        data: [15, 25, 10],
        backgroundColor: [
          '#16a34a',
          '#2563eb',
          '#d97706'
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });
}

/**
 * Gera o relatório de serviços
 * @returns {string} HTML com as linhas da tabela
 */
function generateServicesReport() {
  const services = DB.get('services');
  const total = services.reduce((sum, service) => sum + (service.count * service.price), 0);

  return services.map(service => {
    const revenue = service.count * service.price;
    const percentage = total > 0 ? (revenue / total * 100).toFixed(1) : 0;

    return `
      <tr>
        <td class="px-6 py-4 whitespace-nowrap">${service.name}</td>
        <td class="px-6 py-4 whitespace-nowrap">${service.count}</td>
        <td class="px-6 py-4 whitespace-nowrap">R$ ${revenue.toFixed(2)}</td>
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="flex items-center">
            <div class="w-full bg-gray-200 rounded-full h-2.5 mr-2">
              <div class="bg-purple-600 h-2.5 rounded-full" style="width: ${percentage}%"></div>
            </div>
            <span>${percentage}%</span>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

/**
 * Exporta dados para Excel (simulado)
 */
function exportToExcel() {
  showAlert('info', 'Funcionalidade de exportação será implementada!');
  // Na implementação real, usar biblioteca como SheetJS
}

// =============================================
// 6. Utilitários e Inicialização
// =============================================

/**
 * Mostra um alerta na tela
 * @param {string} type - Tipo de alerta (success, error, info, warning)
 * @param {string} message - Mensagem a ser exibida
 */
function showAlert(type, message) {
  const colors = {
    success: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
    error: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
    info: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
    warning: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' }
  };

  const alert = document.createElement('div');
  alert.className = `fixed top-4 right-4 p-4 rounded-lg border ${colors[type].bg} ${colors[type].text} ${colors[type].border} shadow-lg animate-slideDown z-50`;
  alert.innerHTML = `
    <div class="flex items-center">
      <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
      </svg>
      <span>${message}</span>
    </div>
  `;

  document.body.appendChild(alert);

  setTimeout(() => {
    alert.classList.add('animate-fadeOut');
    setTimeout(() => alert.remove(), 300);
  }, 3000);
}

/**
 * Formata uma data no formato DD/MM/AAAA
 * @param {string} dateString - Data no formato ISO (YYYY-MM-DD)
 * @returns {string} Data formatada
 */
function formatDate(dateString) {
  if (!dateString) return 'Nunca';
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
}

/**
 * Escapa HTML para prevenir XSS
 * @param {string} text - Texto a ser escapado
 * @returns {string} Texto seguro
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Inicializa o menu mobile
 */
function initMobileMenu() {
  document.getElementById('mobileMenuBtn').addEventListener('click', function () {
    document.getElementById('mobileMenu').classList.remove('hidden');
    const navLinks = document.getElementById('navLinks').innerHTML;
    document.getElementById('mobileNavLinks').innerHTML = navLinks;

    // Aplicar tema escuro se necessário
    if (document.documentElement.classList.contains('dark')) {
      document.getElementById('mobileMenu').classList.add('bg-gray-800', 'text-white');
    }

    // Adicionar eventos aos links mobile
    document.querySelectorAll('#mobileNavLinks a').forEach(link => {
      link.addEventListener('click', function () {
        document.getElementById('mobileMenu').classList.add('hidden');
        const page = this.getAttribute('data-page');
        loadPage(page);
      });
    });
  });

  document.getElementById('closeMobileMenu').addEventListener('click', function () {
    document.getElementById('mobileMenu').classList.add('hidden');
  });
}


// Inicialização do sistema quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function () {
  loadNavigation();
  loadDashboard();
  initMobileMenu();
  initProfileModal();

  // Carregar preferência de tema
  const darkModeEnabled = DB.get('darkMode') || false;
  if (darkModeEnabled) {
    document.documentElement.classList.add('dark');
    document.getElementById('settingsDarkMode').checked = true;
    document.getElementById('mobileMenu').classList.add('dark-mode');
  } else {
    document.documentElement.classList.add('light');
  }
});

// Estilos para animações (adicionados dinamicamente)
const style = document.createElement('style');
style.textContent = `
  @keyframes slideDown {
    from { transform: translateY(-20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  @keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }
  .animate-slideDown {
    animation: slideDown 0.3s ease-out;
  }
  .animate-fadeOut {
    animation: fadeOut 0.3s ease-out;
  }
`;
document.head.appendChild(style);

// =============================================
// 7. Configurações e Perfil
// =============================================

/**
 * Carrega a página de configurações
 */
function loadSettings() {
  const content = `
    <div class="bg-white rounded-lg shadow p-6 animate-fadeIn">
      <h3 class="text-lg font-semibold mb-6">Configurações</h3>
      
      <div class="space-y-6">
        <!-- Seção de Perfil -->
        <div class="border-b pb-6">
          <h4 class="font-medium text-gray-800 mb-4">Perfil Profissional</h4>
          <div class="flex flex-col md:flex-row gap-6">
            <div class="flex-shrink-0">
              <div class="relative">
                <img id="settingsProfileImage" src="https://via.placeholder.com/150" class="w-20 h-20 rounded-full object-cover border-2 border-purple-200">
                <label for="settingsImageUpload" class="absolute bottom-0 right-0 bg-purple-600 text-white p-1 rounded-full cursor-pointer hover:bg-purple-700">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </label>
                <input type="file" id="settingsImageUpload" accept="image/*" class="hidden">
              </div>
            </div>
            <div class="flex-1 space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                <input type="text" id="settingsName" class="form-input w-full px-4 py-2 border rounded-lg focus:ring-purple-500 focus:border-purple-500" value="Márcio Silva">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                <input type="tel" id="settingsPhone" class="form-input w-full px-4 py-2 border rounded-lg focus:ring-purple-500 focus:border-purple-500" value="(11) 98765-4321">
              </div>
            </div>
          </div>
        </div>
        
        <!-- Seção de Dados Profissionais -->
        <div class="border-b pb-6">
          <h4 class="font-medium text-gray-800 mb-4">Dados Profissionais</h4>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Especialidades</label>
              <input type="text" id="settingsSpecialties" class="form-input w-full px-4 py-2 border rounded-lg focus:ring-purple-500 focus:border-purple-500" value="Coloração, Cortes Modernos, Luzes">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Descrição Profissional</label>
              <textarea id="settingsBio" rows="3" class="form-input w-full px-4 py-2 border rounded-lg focus:ring-purple-500 focus:border-purple-500">Especialista em coloração e cortes modernos com 10 anos de experiência.</textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Anos de Experiência</label>
              <input type="number" id="settingsExperience" min="0" class="form-input w-full px-4 py-2 border rounded-lg focus:ring-purple-500 focus:border-purple-500" value="10">
            </div>
          </div>
        </div>
        
        <!-- Seção de Preferências -->
        <div>
          <h4 class="font-medium text-gray-800 mb-4">Preferências do Sistema</h4>
          <div class="space-y-4">
            <div class="flex items-center">
              <input type="checkbox" id="settingsDarkMode" class="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded">
              <label for="settingsDarkMode" class="ml-2 block text-sm text-gray-700">Modo Escuro</label>
            </div>
            <div class="flex items-center">
              <input type="checkbox" id="settingsNotifications" checked class="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded">
              <label for="settingsNotifications" class="ml-2 block text-sm text-gray-700">Receber notificações</label>
            </div>
          </div>
        </div>
        
        <div class="pt-4 border-t flex justify-end">
          <button onclick="saveSettings()" class="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors">
            Salvar Configurações
          </button>
        </div>
      </div>
    </div>
  `;

  document.getElementById('mainContent').innerHTML = content;

  // Configurar upload de imagem
  document.getElementById('settingsImageUpload').addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (event) {
        document.getElementById('settingsProfileImage').src = event.target.result;
        // Aqui você pode salvar no localStorage se quiser
      };
      reader.readAsDataURL(file);
    }
  });
}


// Modifique a função saveSettings()
function saveSettings() {
  const darkModeEnabled = document.getElementById('settingsDarkMode').checked;

  // Alternar classes no elemento html
  if (darkModeEnabled) {
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('light');
    document.getElementById('mobileMenu').classList.add('dark-mode');
  } else {
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
    document.getElementById('mobileMenu').classList.remove('dark-mode');
  }

  // Salvar preferência no localStorage
  DB.set('darkMode', darkModeEnabled);

  showAlert('success', `Modo ${darkModeEnabled ? 'escuro' : 'claro'} ativado com sucesso!`);
}

/**
 * Inicializa o modal de perfil
 */
function initProfileModal() {
  document.getElementById('profileBtn').addEventListener('click', function () {
    document.getElementById('profileModal').classList.remove('hidden');
  });

  // Configurar upload de imagem
  document.getElementById('imageUpload').addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (event) {
        document.getElementById('profileImage').src = event.target.result;
        // Aqui você pode salvar no localStorage se quiser
      };
      reader.readAsDataURL(file);
    }
  });
}

/**
 * Salva as alterações do perfil
 */
function saveProfile() {
  // Aqui você pode implementar a lógica para salvar no localStorage
  showAlert('success', 'Perfil atualizado com sucesso!');
  document.getElementById('profileModal').classList.add('hidden');
}

// Adicione isso no seu script.js
function updateFooterDate() {
  const now = new Date();
  
  // Atualiza o ano
  document.getElementById('current-year').textContent = now.getFullYear();
  
  // Formata a data e hora
  const dateOptions = { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  
  const dateTimeStr = now.toLocaleDateString('pt-BR', dateOptions);
  document.getElementById('current-date').textContent = dateTimeStr;
}

// Chame a função quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
  updateFooterDate();
  // Atualize a data/hora a cada minuto
  setInterval(updateFooterDate, 60000);
});