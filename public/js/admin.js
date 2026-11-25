const formatNumber = new Intl.NumberFormat('en-RW', { maximumFractionDigits: 0 });
const formatMoney = new Intl.NumberFormat('en-RW', {
  style: 'currency',
  currency: 'RWF',
  maximumFractionDigits: 0
});

const overviewMessage = document.getElementById('overviewMessage');
const metricsSection = document.getElementById('accountMetrics');

function setValue(id, value, formatter = formatNumber) {
  const element = document.getElementById(id);
  if (element) element.textContent = formatter.format(Number(value) || 0);
}

function renderTrend(trend) {
  const chart = document.getElementById('trendChart');
  if (!chart) return;

  const values = Array.isArray(trend) ? trend : [];
  const today = new Date();
  const start = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - 29));
  const dailyValues = Array.from({ length: 30 }, (_, index) => {
    const date = new Date(start);
    date.setUTCDate(start.getUTCDate() + index);
    const key = date.toISOString().slice(0, 10);
    const record = values.find(item => item.date === key);
    return {
      date,
      earnings: Number(record?.earnings) || 0
    };
  });
  const maxEarnings = Math.max(1, ...dailyValues.map(day => day.earnings));

  chart.replaceChildren();
  dailyValues.forEach((day, index) => {
    const column = document.createElement('span');
    column.className = 'admin-trend-column';
    column.setAttribute('aria-hidden', 'true');
    column.title = `${day.date.toLocaleDateString()}: ${formatMoney.format(day.earnings)}`;

    const bar = document.createElement('span');
    bar.className = 'admin-trend-bar';
    bar.style.height = `${day.earnings > 0 ? Math.max(5, (day.earnings / maxEarnings) * 100) : 2}%`;
    if (index === dailyValues.length - 1) bar.classList.add('is-today');
    column.appendChild(bar);
    chart.appendChild(column);
  });
}

function showMessage(message, isError = false) {
  overviewMessage.textContent = message;
  overviewMessage.classList.toggle('is-error', isError);
  overviewMessage.hidden = !message;
}

async function loadOverview() {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.replace('/login');
    return;
  }

  metricsSection.setAttribute('aria-busy', 'true');
  showMessage('Loading platform analytics…');

  try {
    const response = await fetch('/api/admin/overview', {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.replace('/login');
      return;
    }

    if (response.status === 403) {
      window.location.replace('/dashboard');
      return;
    }

    if (!response.ok) {
      throw new Error(`Analytics request failed (${response.status})`);
    }

    const data = await response.json();
    setValue('totalUsers', data.users?.total);
    setValue('activeUsers', data.users?.active);
    setValue('verifiedUsers', data.users?.verified);
    setValue('newUsers', data.users?.newLast30Days);
    setValue('totalRecords', data.earnings?.records);
    setValue('totalEarnings', data.earnings?.totalEarnings, formatMoney);
    setValue('totalExpenses', data.earnings?.totalExpenses, formatMoney);
    setValue('netProfit', data.earnings?.netProfit, formatMoney);
    setValue('discrepancies', data.earnings?.discrepancies);
    setValue('periodEarnings', data.earnings?.totalEarnings, formatMoney);
    renderTrend(data.dailyTrend);

    const updatedAt = new Date(data.generatedAt);
    document.getElementById('lastUpdated').textContent = `Updated ${updatedAt.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit'
    })}`;
    showMessage('');
  } catch (error) {
    console.error('Unable to load admin overview:', error);
    showMessage('We couldn’t load analytics. Check your connection and try again.', true);
  } finally {
    metricsSection.setAttribute('aria-busy', 'false');
  }
}

document.getElementById('refreshOverview').addEventListener('click', loadOverview);

loadOverview();
