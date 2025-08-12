/**
 * Header Management Script
 * Dynamically manages header content based on authentication state and page context
 */

document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('token');
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const path = window.location.pathname;
    
    // Get DOM elements
    const authButtons = document.getElementById('authButtons');
    const userInfo = document.getElementById('userInfo');
    const userName = document.getElementById('userName');
    const profileDropdownContainer = document.getElementById('profileDropdownContainer');
    const profileDropdown = document.getElementById('profileDropdown');
    
    // Determine page type
    const isPublicPage = ['/', '/login', '/register', '/password-reset', '/otp-verification', '/reset-password'].includes(path);
    const isProtectedPage = ['/dashboard', '/profile', '/settings'].includes(path);
    
    if (token && userData && Object.keys(userData).length > 0) {
        // User is logged in
        if (authButtons) authButtons.style.display = 'none';
        if (userInfo) {
            userInfo.style.display = 'flex';
            const displayName = userData.firstName || userData.name || userData.email || 'User';
            if (userName) userName.textContent = displayName;
        }
        
        // Show profile dropdown
        if (profileDropdownContainer) {
            profileDropdownContainer.style.display = 'block';
        }
        
    } else {
        // User is not logged in
        if (userInfo) userInfo.style.display = 'none';
        if (authButtons) {
            authButtons.style.display = 'flex';
            
            // Customize auth buttons based on page
            if (path === '/login') {
                authButtons.innerHTML = '<a href="/register" class="btn btn-outline">Create Account</a>';
            } else if (path === '/register') {
                authButtons.innerHTML = '<a href="/login" class="btn btn-outline">Sign In</a>';
            } else if (path === '/password-reset' || path === '/otp-verification' || path === '/reset-password') {
                authButtons.innerHTML = '<a href="/login" class="btn btn-outline">Back to Login</a>';
            } else if (path === '/') {
                authButtons.innerHTML = `
                    <a href="/login" class="btn btn-outline">Sign In</a>
                    <a href="/register" class="btn btn-primary">Get Started</a>
                `;
            }
        }
        
        // Hide profile dropdown when user is not logged in
        if (profileDropdownContainer) {
            profileDropdownContainer.style.display = 'none';
        }
    }
    
    // Handle logout
    const logoutLinks = document.querySelectorAll('.logout-link');
    logoutLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Clear localStorage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            sessionStorage.clear();
            
            // Redirect to login page
            window.location.href = '/login';
        });
    });
    
    // Handle profile dropdown toggle - ensure it works on all pages
    const profileIcon = document.getElementById('profileIcon');
    if (profileIcon) {
        // Remove any existing listeners to prevent conflicts
        const newProfileIcon = profileIcon.cloneNode(true);
        profileIcon.parentNode.replaceChild(newProfileIcon, profileIcon);
        
        newProfileIcon.addEventListener('click', function(e) {
            e.stopPropagation();
            const dropdown = document.getElementById('profileDropdown');
            if (dropdown) {
                const expanded = newProfileIcon.getAttribute('aria-expanded') === 'true';
                dropdown.classList.toggle('show');
                newProfileIcon.setAttribute('aria-expanded', !expanded);
            }
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            const dropdown = document.getElementById('profileDropdown');
            if (dropdown && newProfileIcon && !newProfileIcon.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.classList.remove('show');
                newProfileIcon.setAttribute('aria-expanded', 'false');
            }
        });
        
        // Close dropdown on Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                const dropdown = document.getElementById('profileDropdown');
                if (dropdown) {
                    dropdown.classList.remove('show');
                    newProfileIcon.setAttribute('aria-expanded', 'false');
                }
            }
        });
    }
});

/**
 * Update header when user data changes
 */
function updateHeader() {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const userName = document.getElementById('userName');
    
    if (userName && userData && Object.keys(userData).length > 0) {
        const displayName = userData.firstName || userData.name || userData.email || 'User';
        userName.textContent = displayName;
    }
}

// Listen for storage changes (in case user data is updated in another tab)
window.addEventListener('storage', function(e) {
    if (e.key === 'user' || e.key === 'token') {
        location.reload(); // Reload to update header state
    }
});
