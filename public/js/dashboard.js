document.addEventListener('DOMContentLoaded', function () {
  const addTransactionBtn = document.getElementById('addTransactionBtn');
  const addTransactionModal = document.getElementById('addTransactionModal');
  const closeTransactionModal = document.getElementById('closeTransactionModal');
  const transactionForm = document.getElementById('transactionForm');
  const dailyLogsList = document.getElementById('dailyLogsList');
  const previewReportBtn = document.getElementById('previewReportBtn');
  const dashboardStats = document.getElementById('dashboardStats');
  const editTodayLogBtn = document.getElementById('editTodayLogBtn');

  // Pagination and filtering state
  let currentPage = 1;
  let currentFilters = {
    search: '',
    startDate: '',
    endDate: '',
    sortBy: 'date',
    sortOrder: 'desc'
  };
  let paginationInfo = {
    totalPages: 1,
    totalRecords: 0,
    currentPage: 1,
    limit: 20
  };

  // Modal logic
  if (addTransactionBtn && addTransactionModal && closeTransactionModal) {
    addTransactionBtn.addEventListener('click', function () {
      addTransactionModal.style.display = 'flex';
    });
    closeTransactionModal.addEventListener('click', function () {
      addTransactionModal.style.display = 'none';
    });
    addTransactionModal.addEventListener('click', function (e) {
      if (e.target === addTransactionModal) {
        addTransactionModal.style.display = 'none';
      }
    });
  }

  // Helper to get auth headers
  function getAuthHeaders() {
    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  }

  // Fetch and render daily logs with pagination
  async function fetchLogs(page = 1) {
    try {
      const params = new URLSearchParams({
        page: page,
        limit: 20,
        ...currentFilters
      });
      const res = await fetch(`/api/earnings?${params}`, {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      renderLogs(data.earnings);
      updatePagination(data.pagination);
    } catch (err) {
      dailyLogsList.innerHTML = '<div class="error">Failed to load logs.</div>';
    }
  }

  // Update pagination controls
  function updatePagination(pagination) {
    paginationInfo = pagination;
    
    // Update pagination info text
    const paginationInfoEl = document.getElementById('paginationInfo');
    if (paginationInfoEl) {
      const start = (pagination.currentPage - 1) * pagination.limit + 1;
      const end = Math.min(pagination.currentPage * pagination.limit, pagination.totalRecords);
      paginationInfoEl.textContent = `Showing ${start}-${end} of ${pagination.totalRecords} records`;
    }
    
    // Update pagination buttons
    const prevBtn = document.getElementById('prevPageBtn');
    const nextBtn = document.getElementById('nextPageBtn');
    if (prevBtn) prevBtn.disabled = !pagination.hasPrevPage;
    if (nextBtn) nextBtn.disabled = !pagination.hasNextPage;
    
    // Update page numbers
    renderPageNumbers(pagination);
  }

  // Render page numbers
  function renderPageNumbers(pagination) {
    const pageNumbersEl = document.getElementById('pageNumbers');
    if (!pageNumbersEl) return;
    
    const pages = [];
    const current = pagination.currentPage;
    const total = pagination.totalPages;
    
    // Always show first page
    if (current > 1) {
      pages.push(`<button class="page-btn" onclick="goToPage(1)">1</button>`);
    }
    
    // Show ellipsis if needed
    if (current > 3) {
      pages.push('<span class="page-ellipsis">...</span>');
    }
    
    // Show current page and neighbors
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
      if (i === current) {
        pages.push(`<button class="page-btn active" onclick="goToPage(${i})">${i}</button>`);
      } else {
        pages.push(`<button class="page-btn" onclick="goToPage(${i})">${i}</button>`);
      }
    }
    
    // Show ellipsis if needed
    if (current < total - 2) {
      pages.push('<span class="page-ellipsis">...</span>');
    }
    
    // Always show last page
    if (current < total) {
      pages.push(`<button class="page-btn" onclick="goToPage(${total})">${total}</button>`);
    }
    
    pageNumbersEl.innerHTML = pages.join('');
  }

  // Navigation functions
  window.goToPage = function(page) {
    currentPage = page;
    fetchLogs(page);
  };

  window.prevPage = function() {
    if (paginationInfo.hasPrevPage) {
      goToPage(currentPage - 1);
    }
  };

  window.nextPage = function() {
    if (paginationInfo.hasNextPage) {
      goToPage(currentPage + 1);
    }
  };

  function renderLogs(logs) {
    if (!dailyLogsList) return;
    
    if (logs.length === 0) {
      dailyLogsList.innerHTML = '<div class="empty-state">No daily logs found. Add your first log to get started!</div>';
      return;
    }
    const todayStr = new Date().toISOString().split('T')[0];
    dailyLogsList.innerHTML = logs.map(log => {
      const logDateStr = log.date.split('T')[0];
      const date = new Date(log.date).toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
      
      const profitMargin = log.earnings > 0 ? ((log.netProfit / log.earnings) * 100).toFixed(1) : 0;
      const efficiency = log.expectedTotalCapital > 0 ? ((log.earnings / log.expectedTotalCapital) * 100).toFixed(1) : 0;
      
      return `
        <div class="transaction-item ${log.discrepancy ? 'discrepancy' : ''}" data-id="${log._id}">
          <div class="transaction-icon">
            <i class="fas ${log.discrepancy ? 'fa-exclamation-triangle text-warning' : 'fa-chart-line text-success'}"></i>
          </div>
          <div class="transaction-details">
            <h4>${date}</h4>
            <div class="log-metrics">
              <span class="metric">
                <i class="fas fa-coins"></i> Earnings: ${log.earnings}
              </span>
              <span class="metric">
                <i class="fas fa-receipt"></i> Expenses: ${log.expenses}
              </span>
              <span class="metric">
                <i class="fas fa-chart-line"></i> Profit: ${log.netProfit}
              </span>
              <span class="metric ${profitMargin > 20 ? 'success' : profitMargin > 10 ? 'warning' : 'error'}">
                <i class="fas fa-percentage"></i> Margin: ${profitMargin}%
              </span>
            </div>
            <div class="log-balance">
              <span class="balance-item">
                <i class="fas fa-sim-card"></i> MTN: ${log.mtnFloat}
              </span>
              <span class="balance-item">
                <i class="fas fa-money-bill-wave"></i> Cash: ${log.cashInHand}
              </span>
              <span class="balance-item">
                <i class="fas fa-balance-scale"></i> Expected: ${log.expectedTotalCapital}
              </span>
            </div>
            ${log.discrepancy ? '<div class="discrepancy-alert"><i class="fas fa-exclamation-triangle"></i> Discrepancy detected</div>' : ''}
          </div>
          <div class="transaction-actions">
            ${logDateStr === todayStr ? `<button class="action-btn edit-btn" data-id="${log._id}"><i class="fas fa-edit"></i></button><button class="action-btn delete-btn" data-id="${log._id}"><i class="fas fa-trash"></i></button>` : ''}
          </div>
        </div>
      `;
    }).join('');
  }

  // Event delegation for edit and delete buttons
  if (dailyLogsList) {
    dailyLogsList.addEventListener('click', function (e) {
      const editBtn = e.target.closest('.edit-btn');
      const deleteBtn = e.target.closest('.delete-btn');
      if (editBtn && editBtn.dataset.id) {
        editLog(editBtn.dataset.id);
      } else if (deleteBtn && deleteBtn.dataset.id) {
        deleteLog(deleteBtn.dataset.id);
      }
    });
  }

  // Track edit mode and current editing log ID
  let isEditing = false;
  let editingLogId = null;

  // Add/Edit log
  if (transactionForm) {
    transactionForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      const form = e.target;
      const data = {
        date: form.date.value,
        openingCapital: Number(form.openingCapital.value),
        earnings: Number(form.earnings.value),
        expenses: Number(form.expenses.value),
        mtnFloat: Number(form.mtnFloat.value),
        cashInHand: Number(form.cashInHand.value)
      };
      try {
        if (isEditing && editingLogId) {
          // PATCH for editing
          await fetch(`/api/earnings/${editingLogId}`, {
            method: 'PATCH',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
          });
          isEditing = false;
          editingLogId = null;
        } else {
          // POST for new log
          await fetch('/api/earnings', {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
          });
        }
        addTransactionModal.style.display = 'none';
        form.reset();
        fetchLogs(currentPage);
      } catch (err) {
        alert('Failed to save log.');
      }
    });
  }

  // Delete log
  async function deleteLog(id) {
    if (!confirm('Delete this log?')) return;
    try {
      await fetch(`/api/earnings/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
      fetchLogs(currentPage);
    } catch (err) {
      alert('Failed to delete log.');
    }
  }

  // Edit log (only for today's log)
  async function editLog(id) {
    try {
      const res = await fetch(`/api/earnings/${id}`, { headers: getAuthHeaders() });
      if (!res.ok) {
        showToast('Log not found or already deleted.', 'error');
        return;
      }
      const data = await res.json();
      const log = data.log ? data.log : data;
      if (!log || !log._id) throw new Error('Not found');
      addTransactionModal.style.display = 'flex';
      transactionForm.date.value = log.date.split('T')[0];
      transactionForm.openingCapital.value = log.openingCapital;
      transactionForm.earnings.value = log.earnings;
      transactionForm.expenses.value = log.expenses;
      transactionForm.mtnFloat.value = log.mtnFloat;
      transactionForm.cashInHand.value = log.cashInHand;
      transactionForm.date.disabled = true;
      // Remove any previous error message
      let errorMsg = document.getElementById('editErrorMsg');
      if (errorMsg) errorMsg.remove();
      // Set edit mode
      isEditing = true;
      editingLogId = id;
    } catch (err) {
      showToast('Failed to load today’s log.', 'error');
      console.error('Edit error:', err);
    }
  }

  // Toast notification
  function showToast(message, type = 'success') {
    let toast = document.createElement('div');
    toast.textContent = message;
    toast.style.position = 'fixed';
    toast.style.bottom = '2rem';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.background = type === 'success' ? '#22c55e' : '#e11d48';
    toast.style.color = '#fff';
    toast.style.padding = '1rem 2rem';
    toast.style.borderRadius = '0.75rem';
    toast.style.fontWeight = '700';
    toast.style.fontSize = '1.1rem';
    toast.style.zIndex = '9999';
    toast.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
    document.body.appendChild(toast);
    setTimeout(() => { toast.remove(); }, 2500);
  }

  // Highlight recently edited entry
  function highlightEntry(id) {
    setTimeout(() => {
      const entry = document.querySelector(`.transaction-item[data-id='${id}']`);
      if (entry) {
        const originalBg = entry.style.backgroundColor;
        entry.style.backgroundColor = '#e3f0fa';
        entry.style.transition = 'background 0.5s';
        setTimeout(() => {
          entry.style.backgroundColor = originalBg || '';
        }, 2000);
      }
    }, 300); // Wait for logs to render
  }

  // Fetch and render dashboard summary cards
  async function fetchSummary() {
    try {
      const res = await fetch('/api/earnings/summary?period=today', { headers: getAuthHeaders() });
      const summary = await res.json();
      renderSummary(summary);
    } catch (err) {
      if (dashboardStats) dashboardStats.innerHTML = '<div class="error">Failed to load summary.</div>';
    }
  }

  function renderSummary(summary) {
    if (!dashboardStats) return;
    dashboardStats.innerHTML = `
      <div class="stat-card">
        <div class="stat-icon"><i class="fas fa-chart-line"></i></div>
        <div class="stat-content">
          <h3 class="stat-title">Net Profit Today</h3>
          <p class="stat-value">${summary.totalNetProfit || 0}</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon"><i class="fas fa-coins"></i></div>
        <div class="stat-content">
          <h3 class="stat-title">Earnings Today</h3>
          <p class="stat-value">${summary.totalEarnings || 0}</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon"><i class="fas fa-receipt"></i></div>
        <div class="stat-content">
          <h3 class="stat-title">Expenses Today</h3>
          <p class="stat-value">${summary.totalExpenses || 0}</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon"><i class="fas ${summary.discrepancies > 0 ? 'fa-exclamation-triangle' : 'fa-check-circle'}"></i></div>
        <div class="stat-content">
          <h3 class="stat-title">${summary.discrepancies > 0 ? 'Discrepancy' : 'All Balanced'}</h3>
          <p class="stat-value" style="color: ${summary.discrepancies > 0 ? '#e11d48' : '#22c55e'}; font-weight:700;">
            ${summary.discrepancies > 0 ? summary.discrepancies : 'No Issues'}
          </p>
        </div>
      </div>
    `;
  }

  // Fetch insights for different time periods
  async function fetchInsights() {
    try {
      const [todayRes, weekRes, monthRes] = await Promise.all([
        fetch('/api/earnings/summary?period=today', { headers: getAuthHeaders() }),
        fetch('/api/earnings/summary?period=weekly', { headers: getAuthHeaders() }),
        fetch('/api/earnings/summary?period=monthly', { headers: getAuthHeaders() })
      ]);
      const today = await todayRes.json();
      const week = await weekRes.json();
      const month = await monthRes.json();
      renderInsights(today, week, month);
    } catch (err) {
      console.error('Failed to load insights:', err);
    }
  }

  function renderInsights(today, week, month) {
    const todaySummary = document.getElementById('todaySummary');
    const weekSummary = document.getElementById('weekSummary');
    const monthSummary = document.getElementById('monthSummary');

    if (todaySummary) {
      todaySummary.innerHTML = today.totalEarnings ? `
        <div class="insight-item">
          <span class="insight-label">Earnings:</span>
          <span class="insight-value">${today.totalEarnings}</span>
        </div>
        <div class="insight-item">
          <span class="insight-label">Net Profit:</span>
          <span class="insight-value">${today.totalNetProfit}</span>
        </div>
        <div class="insight-item">
          <span class="insight-label">Discrepancies:</span>
          <span class="insight-value ${today.discrepancies > 0 ? 'error' : 'success'}">${today.discrepancies}</span>
        </div>
      ` : '<div class="insight-empty">No data for today</div>';
    }

    if (weekSummary) {
      weekSummary.innerHTML = week.totalEarnings ? `
        <div class="insight-item">
          <span class="insight-label">Total Earnings:</span>
          <span class="insight-value">${week.totalEarnings}</span>
        </div>
        <div class="insight-item">
          <span class="insight-label">Avg Daily:</span>
          <span class="insight-value">${Math.round(week.totalEarnings / 7)}</span>
        </div>
        <div class="insight-item">
          <span class="insight-label">Total Profit:</span>
          <span class="insight-value">${week.totalNetProfit}</span>
        </div>
      ` : '<div class="insight-empty">No data this week</div>';
    }

    if (monthSummary) {
      monthSummary.innerHTML = month.totalEarnings ? `
        <div class="insight-item">
          <span class="insight-label">Total Earnings:</span>
          <span class="insight-value">${month.totalEarnings}</span>
        </div>
        <div class="insight-item">
          <span class="insight-label">Avg Daily:</span>
          <span class="insight-value">${Math.round(month.totalEarnings / 30)}</span>
        </div>
        <div class="insight-item">
          <span class="insight-label">Total Profit:</span>
          <span class="insight-value">${month.totalNetProfit}</span>
        </div>
      ` : '<div class="insight-empty">No data this month</div>';
    }
  }

  // Export functionality
  const exportDataBtn = document.getElementById('exportDataBtn');
  if (exportDataBtn) {
    exportDataBtn.addEventListener('click', async function() {
      try {
        const res = await fetch('/api/earnings', { headers: getAuthHeaders() });
        const logs = await res.json();
        const csv = convertToCSV(logs);
        downloadCSV(csv, 'mtn-agent-logs.csv');
      } catch (err) {
        alert('Failed to export data.');
      }
    });
  }

  function convertToCSV(logs) {
    const headers = ['Date', 'Opening Capital', 'Earnings', 'Expenses', 'MTN Float', 'Cash In Hand', 'Expected Total', 'Net Profit', 'Discrepancy'];
    const rows = logs.map(log => [
      new Date(log.date).toLocaleDateString(),
      log.openingCapital?.toFixed(2) || '0.00',
      log.earnings?.toFixed(2) || '0.00',
      log.expenses?.toFixed(2) || '0.00',
      log.mtnFloat?.toFixed(2) || '0.00',
      log.cashInHand?.toFixed(2) || '0.00',
      log.expectedTotalCapital?.toFixed(2) || '0.00',
      log.netProfit?.toFixed(2) || '0.00',
      log.discrepancy ? 'Yes' : 'No'
    ]);
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  function convertSummaryToCSV(summary, period) {
    const headers = ['Metric', 'Value'];
    const rows = [
      ['Period', period.charAt(0).toUpperCase() + period.slice(1)],
      ['Total Opening Capital', (summary.totalOpening || 0).toFixed(2)],
      ['Total Earnings', (summary.totalEarnings || 0).toFixed(2)],
      ['Total Expenses', (summary.totalExpenses || 0).toFixed(2)],
      ['Total MTN Float', (summary.totalFloat || 0).toFixed(2)],
      ['Total Cash In Hand', (summary.totalCash || 0).toFixed(2)],
      ['Total Expected Capital', (summary.totalExpected || 0).toFixed(2)],
      ['Total Net Profit', (summary.totalNetProfit || 0).toFixed(2)],
      ['Discrepancies', summary.discrepancies || 0]
    ];
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  function downloadCSV(csv, filename) {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  // Filter and search functionality
  const applyFilterBtn = document.getElementById('applyFilterBtn');
  const searchInput = document.getElementById('searchLogs');
  const startDateInput = document.getElementById('startDate');
  const endDateInput = document.getElementById('endDate');
  const sortSelect = document.getElementById('sortBy');

  if (applyFilterBtn) {
    applyFilterBtn.addEventListener('click', function() {
      currentFilters = {
        search: searchInput.value,
        startDate: startDateInput.value,
        endDate: endDateInput.value,
        sortBy: sortSelect.value,
        sortOrder: 'desc'
      };
      currentPage = 1; // Reset to first page when filtering
      fetchLogs(currentPage);
    });
  }

  // Pagination button event listeners
  const prevPageBtn = document.getElementById('prevPageBtn');
  const nextPageBtn = document.getElementById('nextPageBtn');

  if (prevPageBtn) {
    prevPageBtn.addEventListener('click', window.prevPage);
  }

  if (nextPageBtn) {
    nextPageBtn.addEventListener('click', window.nextPage);
  }

  // Notification function
  function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-message">${message}</span>
        <button class="notification-close">&times;</button>
      </div>
    `;
    
    // Add styles
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      max-width: 300px;
      animation: slideIn 0.3s ease;
    `;
    
    notification.querySelector('.notification-content').style.cssText = `
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    `;
    
    notification.querySelector('.notification-close').style.cssText = `
      background: none;
      border: none;
      color: white;
      font-size: 18px;
      cursor: pointer;
      padding: 0;
      line-height: 1;
    `;
    
    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
    
    // Close functionality
    notification.querySelector('.notification-close').addEventListener('click', () => {
      notification.remove();
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 5000);
    
    document.body.appendChild(notification);
  }

  // Initial fetch
  fetchLogs();
  fetchSummary();
  fetchInsights();

  // Export dropdown logic
  const exportDropdownBtn = document.getElementById('exportDropdownBtn');
  const exportDropdownMenu = document.getElementById('exportDropdownMenu');
  const exportAllPdfBtn = document.getElementById('exportAllPdfBtn');
  const exportAllCsvBtn = document.getElementById('exportAllCsvBtn');
  const exportSummaryPdfBtn = document.getElementById('exportSummaryPdfBtn');
  const exportSummaryCsvBtn = document.getElementById('exportSummaryCsvBtn');

  if (exportDropdownBtn && exportDropdownMenu) {
    exportDropdownBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      exportDropdownMenu.style.display = exportDropdownMenu.style.display === 'block' ? 'none' : 'block';
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function() {
      exportDropdownMenu.style.display = 'none';
    });
    
    // Close dropdown on escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        exportDropdownMenu.style.display = 'none';
      }
    });
  }

  // PDF/CSV Export logic
  // Helper: get filtered logs (current filters)
  async function fetchFilteredLogs() {
    const params = new URLSearchParams({
      ...currentFilters,
      page: 1,
      limit: 10000 // large limit for export
    });
    const res = await fetch(`/api/earnings?${params}`, { headers: getAuthHeaders() });
    const data = await res.json();
    return data.earnings || [];
  }

  // Improved PDF export helpers
  function logsToPdf(logs, filename) {
    try {
      if (!window.jspdf) {
        throw new Error('jsPDF library not loaded');
      }
      
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      const title = 'Money Tracker Pro - Transaction Logs';
      const dateStr = new Date().toLocaleString();
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      // Header
      doc.setFontSize(18);
      doc.setTextColor(0, 79, 113);
      doc.text(title, 14, 18);
      
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Exported: ${dateStr}`, 14, 26);
      if (user.name) {
        doc.text(`User: ${user.name}`, 14, 32);
      }

      // Table
      const headers = [['Date', 'Opening Capital', 'Earnings', 'Expenses', 'MTN Float', 'Cash In Hand', 'Expected Total', 'Net Profit', 'Discrepancy']];
      const rows = logs.map(log => [
        new Date(log.date).toLocaleDateString(),
        `$${log.openingCapital?.toFixed(2) || '0.00'}`,
        `$${log.earnings?.toFixed(2) || '0.00'}`,
        `$${log.expenses?.toFixed(2) || '0.00'}`,
        `$${log.mtnFloat?.toFixed(2) || '0.00'}`,
        `$${log.cashInHand?.toFixed(2) || '0.00'}`,
        `$${log.expectedTotalCapital?.toFixed(2) || '0.00'}`,
        `$${log.netProfit?.toFixed(2) || '0.00'}`,
        log.discrepancy ? 'Yes' : 'No'
      ]);
      
      doc.autoTable({
        head: headers,
        body: rows,
        startY: 40,
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [0, 79, 113], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [248, 249, 250] },
        margin: { left: 10, right: 10 },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 25 },
          2: { cellWidth: 20 },
          3: { cellWidth: 20 },
          4: { cellWidth: 20 },
          5: { cellWidth: 25 },
          6: { cellWidth: 25 },
          7: { cellWidth: 20 },
          8: { cellWidth: 15 }
        }
      });
      
      doc.save(filename);
      showNotification('Export successful!', 'success');
    } catch (error) {
      console.error('PDF Export Error:', error);
      showNotification('Export failed: ' + error.message, 'error');
    }
  }

  function summaryToPdf(summary, period, filename) {
    try {
      if (!window.jspdf) {
        throw new Error('jsPDF library not loaded');
      }
      
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      const title = `Money Tracker Pro - ${period.charAt(0).toUpperCase() + period.slice(1)} Summary`;
      const dateStr = new Date().toLocaleString();
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      // Header
      doc.setFontSize(18);
      doc.setTextColor(0, 79, 113);
      doc.text(title, 14, 18);
      
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Exported: ${dateStr}`, 14, 26);
      if (user.name) {
        doc.text(`User: ${user.name}`, 14, 32);
      }

      // Summary table
      const headers = [['Metric', 'Value']];
      const rows = [
        ['Total Opening Capital', `$${(summary.totalOpening || 0).toFixed(2)}`],
        ['Total Earnings', `$${(summary.totalEarnings || 0).toFixed(2)}`],
        ['Total Expenses', `$${(summary.totalExpenses || 0).toFixed(2)}`],
        ['Total MTN Float', `$${(summary.totalFloat || 0).toFixed(2)}`],
        ['Total Cash In Hand', `$${(summary.totalCash || 0).toFixed(2)}`],
        ['Total Expected Capital', `$${(summary.totalExpected || 0).toFixed(2)}`],
        ['Total Net Profit', `$${(summary.totalNetProfit || 0).toFixed(2)}`],
        ['Discrepancies', summary.discrepancies || 0]
      ];
      
      doc.autoTable({
        head: headers,
        body: rows,
        startY: 40,
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: { fillColor: [0, 79, 113], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [248, 249, 250] },
        margin: { left: 10, right: 10 },
        columnStyles: {
          0: { cellWidth: 80, fontStyle: 'bold' },
          1: { cellWidth: 60, halign: 'right' }
        }
      });
      
      doc.save(filename);
      showNotification('Summary export successful!', 'success');
    } catch (error) {
      console.error('Summary PDF Export Error:', error);
      showNotification('Summary export failed: ' + error.message, 'error');
    }
  }

  // Export logic
  if (exportAllPdfBtn) {
    exportAllPdfBtn.addEventListener('click', async function(e) {
      e.preventDefault();
      try {
        showNotification('Preparing PDF export...', 'info');
        const res = await fetch('/api/earnings', { headers: getAuthHeaders() });
        if (!res.ok) throw new Error('Failed to fetch data');
        const data = await res.json();
        logsToPdf(data.earnings || [], 'money-tracker-logs.pdf');
      } catch (error) {
        console.error('Export All PDF Error:', error);
        showNotification('PDF export failed: ' + error.message, 'error');
      }
    });
  }
  
  if (exportAllCsvBtn) {
    exportAllCsvBtn.addEventListener('click', async function(e) {
      e.preventDefault();
      try {
        showNotification('Preparing CSV export...', 'info');
        const res = await fetch('/api/earnings', { headers: getAuthHeaders() });
        if (!res.ok) throw new Error('Failed to fetch data');
        const data = await res.json();
        const csv = convertToCSV(data.earnings || []);
        downloadCSV(csv, 'money-tracker-logs.csv');
        showNotification('CSV export successful!', 'success');
      } catch (error) {
        console.error('Export All CSV Error:', error);
        showNotification('CSV export failed: ' + error.message, 'error');
      }
    });
  }
  
  if (exportSummaryPdfBtn) {
    exportSummaryPdfBtn.addEventListener('click', async function(e) {
      e.preventDefault();
      try {
        showNotification('Preparing summary PDF export...', 'info');
        const res = await fetch('/api/earnings/summary?period=today', { headers: getAuthHeaders() });
        if (!res.ok) throw new Error('Failed to fetch summary data');
        const summary = await res.json();
        summaryToPdf(summary, 'today', 'money-tracker-summary-today.pdf');
      } catch (error) {
        console.error('Export Summary PDF Error:', error);
        showNotification('Summary PDF export failed: ' + error.message, 'error');
      }
    });
  }
  
  if (exportSummaryCsvBtn) {
    exportSummaryCsvBtn.addEventListener('click', async function(e) {
      e.preventDefault();
      try {
        showNotification('Preparing summary CSV export...', 'info');
        const res = await fetch('/api/earnings/summary?period=today', { headers: getAuthHeaders() });
        if (!res.ok) throw new Error('Failed to fetch summary data');
        const summary = await res.json();
        const csv = convertSummaryToCSV(summary, 'today');
        downloadCSV(csv, 'money-tracker-summary-today.csv');
        showNotification('Summary CSV export successful!', 'success');
      } catch (error) {
        console.error('Export Summary CSV Error:', error);
        showNotification('Summary CSV export failed: ' + error.message, 'error');
      }
    });
  }
}); 