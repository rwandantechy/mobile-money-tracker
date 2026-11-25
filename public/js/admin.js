const formatNumber = new Intl.NumberFormat('en-RW', { maximumFractionDigits: 0 });
const formatMoney = new Intl.NumberFormat('en-RW', {
  style: 'currency',
  currency: 'RWF',
  maximumFractionDigits: 0
});
const formatCompact = new Intl.NumberFormat('en-RW', {
  notation: 'compact',
  maximumFractionDigits: 1
});
const formatPercent = new Intl.NumberFormat('en-RW', {
  style: 'percent',
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
  const valuesByDate = new Map(values.map(item => [item.date, item]));
  const today = new Date();
  const start = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - 29));
  const dailyValues = Array.from({ length: 30 }, (_, index) => {
    const date = new Date(start);
    date.setUTCDate(start.getUTCDate() + index);
    const key = date.toISOString().slice(0, 10);
    const record = valuesByDate.get(key);
    return {
      date,
      earnings: Number(record?.earnings) || 0
    };
  });
  const peakEarnings = Math.max(0, ...dailyValues.map(day => day.earnings));
  const chartScale = peakEarnings || 1;

  chart.replaceChildren();
  document.getElementById('chartMax').textContent = formatCompact.format(peakEarnings);
  dailyValues.forEach((day, index) => {
    const column = document.createElement('span');
    column.className = 'admin-trend-column';
    column.setAttribute('aria-hidden', 'true');
    column.title = `${day.date.toLocaleDateString()}: ${formatMoney.format(day.earnings)}`;

    const bar = document.createElement('span');
    bar.className = 'admin-trend-bar';
    bar.style.height = `${day.earnings > 0 ? Math.max(4, (day.earnings / chartScale) * 100) : 1}%`;
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
    const totalUsers = Number(data.users?.total) || 0;
    const activeUsers = Number(data.users?.active) || 0;
    const verifiedUsers = Number(data.users?.verified) || 0;

    setValue('totalUsers', totalUsers);
    setValue('activeUsers', activeUsers);
    setValue('activeUsersDetail', activeUsers);
    setValue('verifiedUsers', verifiedUsers);
    setValue('newUsers', data.users?.newLast30Days);
    setValue('totalRecords', data.earnings?.records);
    setValue('totalExpenses', data.earnings?.totalExpenses, formatMoney);
    setValue('netProfit', data.earnings?.netProfit, formatMoney);
    setValue('discrepancies', data.earnings?.discrepancies);
    setValue('periodEarnings', data.earnings?.totalEarnings, formatMoney);
    const activeRate = totalUsers ? Math.min(1, activeUsers / totalUsers) : 0;
    const verifiedRate = totalUsers ? Math.min(1, verifiedUsers / totalUsers) : 0;
    document.getElementById('activeProgress').style.width =
      `${activeRate * 100}%`;
    document.getElementById('verifiedProgress').style.width =
      `${verifiedRate * 100}%`;
    document.getElementById('activeRate').textContent = formatPercent.format(activeRate);
    document.getElementById('verifiedRate').textContent = formatPercent.format(verifiedRate);
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
