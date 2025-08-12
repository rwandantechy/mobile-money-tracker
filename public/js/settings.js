/**
 * Settings Page Management
 * Populates settings form with user data and handles settings updates
 */

document.addEventListener('DOMContentLoaded', function() {
    // Get user data from localStorage
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('token');
    
    // Check if user is authenticated
    if (!token || !userData || Object.keys(userData).length === 0) {
        window.location.href = '/login';
        return;
    }
    
    // Populate form fields with user data
    populateSettingsForm(userData);
    
    // Handle form submission
    const settingsForm = document.getElementById('settingsForm');
    if (settingsForm) {
        settingsForm.addEventListener('submit', handleSettingsSubmit);
    }
    
    // Handle password change
    const changePasswordBtn = document.getElementById('changePasswordBtn');
    if (changePasswordBtn) {
        changePasswordBtn.addEventListener('click', handlePasswordChange);
    }
    
    // Handle theme change
    const themeSelect = document.getElementById('theme');
    if (themeSelect) {
        themeSelect.addEventListener('change', handleThemeChange);
    }
    
    // Load saved settings from localStorage
    loadSavedSettings();
});

/**
 * Populate settings form with user data
 */
function populateSettingsForm(userData) {
    // Account information
    const emailField = document.getElementById('email');
    const phoneField = document.getElementById('phone');
    
    if (emailField) {
        emailField.value = userData.email || '';
    }
    
    if (phoneField) {
        phoneField.value = userData.phone || '';
    }
    
    // Update header with user name
    const userName = document.getElementById('userName');
    if (userName) {
        const displayName = userData.firstName || userData.name || userData.email || 'User';
        userName.textContent = displayName;
    }
    
    // Update profile picture if available
    if (userData.profilePicture) {
        const profileIcon = document.getElementById('profileIcon');
        if (profileIcon) {
            profileIcon.innerHTML = `<img src="${userData.profilePicture}" alt="Profile" class="profile-image" style="width: 30px; height: 30px; border-radius: 50%; object-fit: cover;">`;
        }
    }
}

/**
 * Load saved settings from localStorage
 */
function loadSavedSettings() {
    const savedSettings = JSON.parse(localStorage.getItem('userSettings') || '{}');
    
    // Theme
    const themeSelect = document.getElementById('theme');
    if (themeSelect && savedSettings.theme) {
        themeSelect.value = savedSettings.theme;
        applyTheme(savedSettings.theme);
    }
    
    // Notification preferences
    const emailNotifications = document.getElementById('emailNotifications');
    const smsNotifications = document.getElementById('smsNotifications');
    const pushNotifications = document.getElementById('pushNotifications');
    
    if (emailNotifications && savedSettings.emailNotifications) {
        emailNotifications.value = savedSettings.emailNotifications;
    }
    
    if (smsNotifications && savedSettings.smsNotifications) {
        smsNotifications.value = savedSettings.smsNotifications;
    }
    
    if (pushNotifications && savedSettings.pushNotifications) {
        pushNotifications.value = savedSettings.pushNotifications;
    }
    
    // Two-factor authentication
    const twoFactor = document.getElementById('twoFactor');
    if (twoFactor && savedSettings.twoFactor !== undefined) {
        twoFactor.checked = savedSettings.twoFactor;
    }
}

/**
 * Handle settings form submission
 */
function handleSettingsSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const settings = {
        theme: formData.get('theme'),
        emailNotifications: formData.get('emailNotifications'),
        smsNotifications: formData.get('smsNotifications'),
        pushNotifications: formData.get('pushNotifications'),
        twoFactor: formData.get('twoFactor') === 'on'
    };
    
    // Save settings to localStorage
    localStorage.setItem('userSettings', JSON.stringify(settings));
    
    // Apply theme immediately
    if (settings.theme) {
        applyTheme(settings.theme);
    }
    
    // Show success message
    showNotification('Settings saved successfully!', 'success');
}

/**
 * Handle password change
 */
function handlePasswordChange(e) {
    e.preventDefault();
    
    const newPassword = document.getElementById('changePassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (!newPassword || !confirmPassword) {
        showNotification('Please fill in both password fields', 'error');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showNotification('Passwords do not match', 'error');
        return;
    }
    
    if (newPassword.length < 6) {
        showNotification('Password must be at least 6 characters long', 'error');
        return;
    }
    
    // Here you would typically make an API call to update the password
    // For now, we'll just show a success message
    showNotification('Password updated successfully!', 'success');
    
    // Clear password fields
    document.getElementById('changePassword').value = '';
    document.getElementById('confirmPassword').value = '';
}

/**
 * Handle theme change
 */
function handleThemeChange(e) {
    const theme = e.target.value;
    applyTheme(theme);
    
    // Save theme preference
    const savedSettings = JSON.parse(localStorage.getItem('userSettings') || '{}');
    savedSettings.theme = theme;
    localStorage.setItem('userSettings', JSON.stringify(savedSettings));
}

/**
 * Apply theme to the page
 */
function applyTheme(theme) {
    const body = document.body;
    
    // Remove existing theme classes
    body.classList.remove('theme-light', 'theme-dark');
    
    // Apply new theme
    if (theme === 'dark') {
        body.classList.add('theme-dark');
    } else if (theme === 'light') {
        body.classList.add('theme-light');
    } else {
        // System default - check user's system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            body.classList.add('theme-dark');
        } else {
            body.classList.add('theme-light');
        }
    }
}

/**
 * Show notification message
 */
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 1rem;
        border-radius: 0.5rem;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        min-width: 300px;
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

/**
 * Update user data when it changes
 */
function updateUserDisplay() {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    populateSettingsForm(userData);
}

// Listen for storage changes (in case user data is updated in another tab)
window.addEventListener('storage', function(e) {
    if (e.key === 'user') {
        updateUserDisplay();
    }
});
