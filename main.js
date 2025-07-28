// Header functionality
document.addEventListener('DOMContentLoaded', function() {
  // Dropdown menu functionality
  const dropdownItems = document.querySelectorAll('.nav-item.dropdown');
  
  dropdownItems.forEach(item => {
    const link = item.querySelector('.nav-link');
    const arrow = item.querySelector('.dropdown-arrow');
    
    link.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Close other dropdowns
      dropdownItems.forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove('active');
        }
      });
      
      // Toggle current dropdown
      item.classList.toggle('active');
    });
  });
  
  // Close dropdowns when clicking outside
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.nav-item.dropdown')) {
      dropdownItems.forEach(item => {
        item.classList.remove('active');
      });
    }
  });
  
  // Search functionality
  const searchInput = document.querySelector('.search-input');
  if (searchInput) {
    searchInput.addEventListener('focus', function() {
      this.parentElement.style.border = '1px solid #ffbe2e';
    });
    
    searchInput.addEventListener('blur', function() {
      this.parentElement.style.border = 'none';
    });
  }
  
  // Header scroll effect
  let lastScrollTop = 0;
  const header = document.querySelector('.bybit-header');
  
  window.addEventListener('scroll', function() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop > lastScrollTop && scrollTop > 100) {
      // Scrolling down
      header.style.transform = 'translateY(-100%)';
    } else {
      // Scrolling up
      header.style.transform = 'translateY(0)';
    }
    
    lastScrollTop = scrollTop;
  });
  
  // Button click handlers
  const loginBtn = document.querySelector('.btn-login');
  const signupBtn = document.querySelector('.btn-signup');
  
  if (loginBtn) {
    loginBtn.addEventListener('click', function() {
      alert('登录功能即将推出！');
    });
  }
  
  if (signupBtn) {
    signupBtn.addEventListener('click', function() {
      alert('注册功能即将推出！');
    });
  }
  
  // Icon button handlers
  const downloadBtn = document.querySelector('.download-icon');
  const globeBtn = document.querySelector('.globe-icon');
  
  if (downloadBtn) {
    downloadBtn.addEventListener('click', function() {
      alert('下载应用功能即将推出！');
    });
  }
  
  if (globeBtn) {
    globeBtn.addEventListener('click', function() {
      alert('语言选择功能即将推出！');
    });
  }
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// Connect to WebSocket and update marketTabContent
window.addEventListener('DOMContentLoaded', () => {
  const ws = new WebSocket('wss://api.cloveragency.co/ws');
  // Store latest data for each symbol
  const symbolMap = {};
  // Track if a row for a symbol has been rendered
  const renderedSymbols = new Set();
  ws.addEventListener('open', () => {
    ws.send(JSON.stringify({ type: 'sub', params: 'DAY_MARKET' }));
    ws.send('ping');
  });
  ws.addEventListener('message', (event) => {
    let data;
    try {
      data = JSON.parse(event.data);
    } catch (e) {
      return;
    }
    if (data.type === 'DAY_MARKET' && data.quotation && data.symbol) {
      symbolMap[data.symbol] = data;
      updateMarketTabContent(symbolMap, data.symbol, data);
    }
  });
  // Initial render of the table structure
  renderMarketTabTable();
});

function renderMarketTabTable() {
  const container = document.getElementById('marketTabContent');
  if (!container) return;
  container.innerHTML = `
    <div class="tab-pane fade show active" id="hot-derivatives" role="tabpanel" aria-labelledby="hot-derivatives-tab">
      <div class="row fw-semibold text-secondary mb-2" style="font-size:0.8rem;">
        <div class="col-4">Trading Pairs</div>
        <div class="col-3">Last Traded Price</div>
        <div class="col-2">24H Change</div>
        <div class="col-1">Trade</div>
      </div>
      <div id="marketRows"></div>
    </div>
  `;
}

function updateMarketTabContent(symbolMap, symbol, data) {
  const rowsContainer = document.getElementById('marketRows');
  if (!rowsContainer) return;
  // If row for this symbol does not exist, create it
  let row = document.getElementById('row-' + symbol.replace(/[^a-zA-Z0-9]/g, ''));
  if (!row) {
    const coinSymbol = symbol.split('/')[0];
    const iconPath = `https://api.cloveragency.co/images/coin/${coinSymbol}.png`;
    // Placeholder SVG for chart
    const chartSVG = `
      <svg width="40" height="18" viewBox="0 0 52 22" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align:middle;">
        <defs>
          <linearGradient id="jb6he9m1ou" x1="0" y1="0" x2="0" y2="22" gradientUnits="userSpaceOnUse">
            <stop stop-color="#4ade80" />
            <stop offset="1" stop-color="#bbf7d0" stop-opacity="0.2" />
          </linearGradient>
        </defs>
        <path d="M-1 20L-1 15.39L0 15.39L2.17 15.12L4.34 17.34L6.51 16.25L8.68 17.31L10.85 18L13.02 15.73L15.19 14.3L17.36 15.07L19.53 13.14L21.7 14.35L23.87 15.53L26.04 13.46L28.21 13.45L30.38 9.45L32.55 10.97L34.72 8.61L36.89 8.58L39.06 11.23L41.23 11.87L43.4 11.44L45.57 12.47L47.74 5L49.91 5.43L51 21 Z" fill="url(#jb6he9m1ou)" stroke="rgba(24, 22, 55, .11)" stroke-width="1"></path>
      </svg>
    `;
    row = document.createElement('div');
    row.className = 'row align-items-center mb-2';
    row.id = 'row-' + symbol.replace(/[^a-zA-Z0-9]/g, '');
    row.innerHTML = `
      <div class="col-4 d-flex align-items-center gap-2">
        <img src="${iconPath}" alt="${coinSymbol}" width="22" height="22" onerror="this.style.display='none'">
        <span>${symbol.replace('/', '')}</span>
      </div>
      <div class="col-3 fw-bold price">${data.quotation.close}</div>
      <div class="col-2 change fw-bold"></div>
      <div class="col-1"><a href="#" class="btn btn-trade-custom text-warning fw-bold" style="font-size:0.92rem;padding:0.2rem 0.7rem;border-radius:7px;border:1.5px solid #ffbe2e;background:#fff;">Trade</a></div>
    `;
    rowsContainer.appendChild(row);
  }
  // Update price and change only
  row.querySelector('.price').textContent = data.quotation.close;
  let change = parseFloat(data.quotation.change);
  let changeClass = change > 0 ? 'text-success' : (change < 0 ? 'text-danger' : '');
  let changeText = (change > 0 ? '+' : '') + data.quotation.change + '%';
  const changeDiv = row.querySelector('.change');
  changeDiv.textContent = changeText;
  changeDiv.className = 'col-2 change fw-bold ' + changeClass;
}
