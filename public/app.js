// Check authentication
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }
}

// Add auth header to all API requests
function getAuthHeader() {
    const token = localStorage.getItem('token');
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
}

// DOM Elements
const earningsForm = document.getElementById('earningsForm');
const earningsTable = document.getElementById('earningsTable').getElementsByTagName('tbody')[0];
const weeklySummaryBtn = document.getElementById('weeklySummary');
const monthlySummaryBtn = document.getElementById('monthlySummary');
const summaryContent = document.getElementById('summaryContent');
const userInfo = document.getElementById('userInfo');
const logoutBtn = document.getElementById('logoutBtn');

// Input fields for net calculation
const mtnInput = document.getElementById('mtn');
const airtelInput = document.getElementById('airtel');
const bonusInput = document.getElementById('bonus');
const expensesInput = document.getElementById('expenses');
const netInput = document.getElementById('net');

// API URL
const API_URL = '/api/earnings';

// Calculate net profit
function calculateNet() {
    const mtn = parseFloat(mtnInput.value) || 0;
    const airtel = parseFloat(airtelInput.value) || 0;
    const bonus = parseFloat(bonusInput.value) || 0;
    const expenses = parseFloat(expensesInput.value) || 0;
    const net = mtn + airtel + bonus - expenses;
    netInput.value = net.toFixed(2);
}

// Add event listeners for net calculation
[mtnInput, airtelInput, bonusInput, expensesInput].forEach(input => {
    input.addEventListener('input', calculateNet);
});

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-RW', {
        style: 'currency',
        currency: 'RWF'
    }).format(amount);
}

// Format date
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-RW', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Create table row
function createTableRow(earning) {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${formatDate(earning.date)}</td>
        <td>${formatCurrency(earning.mtn)}</td>
        <td>${formatCurrency(earning.airtel)}</td>
        <td>${formatCurrency(earning.bonus)}</td>
        <td>${formatCurrency(earning.expenses)}</td>
        <td class="${earning.net >= 0 ? 'text-success' : 'text-danger'}">${formatCurrency(earning.net)}</td>
        <td>
            <button class="action-btn edit-btn" onclick="editEarning('${earning._id}')">Edit</button>
            <button class="action-btn delete-btn" onclick="deleteEarning('${earning._id}')">Delete</button>
        </td>
    `;
    return row;
}

// Fetch and display earnings
async function fetchEarnings() {
    try {
        const response = await fetch(API_URL, {
            headers: getAuthHeader()
        });
        
        if (response.status === 401) {
            window.location.href = 'login.html';
            return;
        }

        const earnings = await response.json();
        earningsTable.innerHTML = '';
        earnings.forEach(earning => {
            earningsTable.appendChild(createTableRow(earning));
        });
    } catch (error) {
        console.error('Error fetching earnings:', error);
        alert('Error fetching earnings. Please try again.');
    }
}

// Submit form
earningsForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;
    const datetime = new Date(`${date}T${time}`).toISOString();
    
    const formData = {
        date: datetime,
        user: localStorage.getItem('user'),
        mtn: parseFloat(mtnInput.value) || 0,
        airtel: parseFloat(airtelInput.value) || 0,
        bonus: parseFloat(bonusInput.value) || 0,
        expenses: parseFloat(expensesInput.value) || 0
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: getAuthHeader(),
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            earningsForm.reset();
            netInput.value = '';
            fetchEarnings();
            alert('Record saved successfully!');
        } else {
            throw new Error('Failed to save record');
        }
    } catch (error) {
        console.error('Error saving record:', error);
        alert('Error saving record. Please try again.');
    }
});

// Delete earning
async function deleteEarning(id) {
    if (!confirm('Are you sure you want to delete this record?')) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
            headers: getAuthHeader()
        });

        if (response.ok) {
            fetchEarnings();
            alert('Record deleted successfully!');
        } else {
            throw new Error('Failed to delete record');
        }
    } catch (error) {
        console.error('Error deleting record:', error);
        alert('Error deleting record. Please try again.');
    }
}

// Edit earning
async function editEarning(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            headers: getAuthHeader()
        });
        const earning = await response.json();

        document.getElementById('date').value = earning.date.split('T')[0];
        mtnInput.value = earning.mtn;
        airtelInput.value = earning.airtel;
        bonusInput.value = earning.bonus;
        expensesInput.value = earning.expenses;
        calculateNet();

        // Scroll to form
        document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        console.error('Error fetching earning:', error);
        alert('Error fetching record. Please try again.');
    }
}

// Fetch summary
async function fetchSummary(period) {
    try {
        const response = await fetch(`${API_URL}/summary?period=${period}`, {
            headers: getAuthHeader()
        });
        const summary = await response.json();

        summaryContent.innerHTML = `
            <div class="summary-grid">
                <div class="summary-item">
                    <h3>MTN Total</h3>
                    <p>${formatCurrency(summary.totalMtn)}</p>
                </div>
                <div class="summary-item">
                    <h3>Airtel Total</h3>
                    <p>${formatCurrency(summary.totalAirtel)}</p>
                </div>
                <div class="summary-item">
                    <h3>Bonus Total</h3>
                    <p>${formatCurrency(summary.totalBonus)}</p>
                </div>
                <div class="summary-item">
                    <h3>Expenses Total</h3>
                    <p>${formatCurrency(summary.totalExpenses)}</p>
                </div>
                <div class="summary-item">
                    <h3>Net Profit</h3>
                    <p class="${summary.totalNet >= 0 ? 'text-success' : 'text-danger'}">
                        ${formatCurrency(summary.totalNet)}
                    </p>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error fetching summary:', error);
        alert('Error fetching summary. Please try again.');
    }
}

// Add event listeners for summary buttons
weeklySummaryBtn.addEventListener('click', () => fetchSummary('weekly'));
monthlySummaryBtn.addEventListener('click', () => fetchSummary('monthly'));

// Handle logout
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    });
}

// Display user info
function displayUserInfo() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && userInfo) {
        userInfo.textContent = `Welcome, ${user.fullName}`;
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    displayUserInfo();
    fetchEarnings();
    fetchSummary('monthly');
}); 