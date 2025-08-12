/**
 * User Data Population Script
 * Dynamically populates user information from localStorage
 */

document.addEventListener('DOMContentLoaded', function() {
    // Get user data from localStorage
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('token');
    
    
    // Get DOM elements
    const userInfoElement = document.getElementById('userInfo');
    const profileDropdown = document.getElementById('profileDropdown');
    const userSection = document.querySelector('.user-section');
    
    if (token && userData && Object.keys(userData).length > 0) {
        // User is logged in - show user info
        if (userInfoElement) {
            const userName = userData.name || userData.firstName || userData.email || 'User';
            userInfoElement.textContent = `Welcome, ${userName}`;
        }
        
        // Show user section
        if (userSection) {
            userSection.style.display = 'flex';
        }
        
        // Update profile dropdown links with user-specific data
        if (profileDropdown) {
            const profileLink = profileDropdown.querySelector('a[href="/pages/profile.html"]');
            if (profileLink) {
                profileLink.innerHTML = `
                    <i class="fas fa-user"></i>
                    ${userData.name || userData.firstName || 'View Profile'}
                `;
            }
        }
        
        // Add user avatar if available
        if (userData.avatar) {
            const profileIcon = document.getElementById('profileIcon');
            if (profileIcon) {
                profileIcon.innerHTML = `<img src="${userData.avatar}" alt="Profile" class="user-avatar">`;
            }
        }
        
    } else {
        // User is not logged in - show login/register buttons
        if (userSection) {
            userSection.innerHTML = `
                <div class="auth-buttons">
                    <a href="/pages/login.html" class="btn btn-outline">Login</a>
                    <a href="/pages/register.html" class="btn btn-primary">Sign Up</a>
                </div>
            `;
        }
    }
    
    // Add logout functionality
    const logoutLinks = document.querySelectorAll('.logout-link');
    logoutLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Clear localStorage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            sessionStorage.clear();
            
            // Redirect to login page
            window.location.href = '/pages/login.html';
        });
    });
});

/**
 * Update user data when it changes
 */
function updateUserDisplay() {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const userInfoElement = document.getElementById('userInfo');
    
    if (userInfoElement && userData && Object.keys(userData).length > 0) {
        const userName = userData.name || userData.firstName || userData.email || 'User';
        userInfoElement.textContent = `Welcome, ${userName}`;
    }
}

// Listen for storage changes (in case user data is updated in another tab)
window.addEventListener('storage', function(e) {
    if (e.key === 'user') {
        updateUserDisplay();
    }
});
