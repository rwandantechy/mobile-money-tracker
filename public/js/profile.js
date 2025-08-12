/**
 * Profile Management Script
 * Handles profile page functionality including data loading, updates, and profile picture management
 */

document.addEventListener('DOMContentLoaded', function() {
    // Get user data from localStorage
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('token');
    
    // Get DOM elements
    const userInfoElement = document.getElementById('userInfo');
    const profileForm = document.getElementById('profileForm');
    const fullNameInput = document.getElementById('fullName');
    const phoneInput = document.getElementById('phone');
    const emailInput = document.getElementById('email');
    const roleInput = document.getElementById('role');
    const verificationStatus = document.getElementById('verificationStatus');
    const profilePic = document.getElementById('profilePic');
    const changePicBtn = document.getElementById('changePicBtn');
    const deleteAccountBtn = document.getElementById('deleteAccountBtn');
    
    // Check authentication
    if (!token || !userData || Object.keys(userData).length === 0) {
        window.location.href = '/login';
        return;
    }
    
    // Update header user info
    if (userInfoElement) {
        const userName = `${userData.firstName || ''} `;
        userInfoElement.textContent = ` ${userName}`;
    }
    
    // Load user profile data from localStorage
    loadUserProfile();
    
    // Event listeners
    if (profileForm) {
        profileForm.addEventListener('submit', handleProfileUpdate);
    }
    
    if (changePicBtn) {
        changePicBtn.addEventListener('click', handleProfilePictureChange);
    }
    
    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', handleAccountDeletion);
    }
    
    /**
     * Load user profile data from localStorage
     */
    function loadUserProfile() {
        // Populate form fields from localStorage
        if (fullNameInput) {
            const fullName = userData.fullName || `${userData.firstName || ''} ${userData.lastName || ''}`.trim();
            fullNameInput.value = fullName;
        }
        if (phoneInput) phoneInput.value = userData.phone || '';
        if (emailInput) emailInput.value = userData.email || '';
        if (roleInput) roleInput.value = userData.role || 'user';
        
        // Update verification status
        if (verificationStatus) {
            const isVerified = userData.isVerified === true || userData.isVerified === 'true';
            verificationStatus.textContent = isVerified ? 'Verified' : 'Unverified';
            verificationStatus.className = isVerified ? 'verified' : 'unverified';
        }
        
        // Update profile picture if available
        if (userData.profilePicture && profilePic) {
            profilePic.src = userData.profilePicture;
        }
    }
    
    /**
     * Handle profile form submission
     */
    function handleProfileUpdate(e) {
        e.preventDefault();
        
        const newFullName = fullNameInput.value.trim();
        
        // Update localStorage user data
        userData.fullName = newFullName;
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Update header
        if (userInfoElement) {
            userInfoElement.textContent = `Welcome, ${newFullName}`;
        }
        
        showToast('Profile updated successfully', 'success');
    }
    
    /**
     * Handle profile picture change
     */
    function handleProfilePictureChange() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async function(e) {
            const file = e.target.files[0];
            if (file) {
                // For now, just show a placeholder
                // In a real app, you'd upload to a server
                const reader = new FileReader();
                reader.onload = function(e) {
                    if (profilePic) {
                        profilePic.src = e.target.result;
                    }
                };
                reader.readAsDataURL(file);
                showToast('Profile picture updated (demo only)', 'info');
            }
        };
        input.click();
    }
    
    /**
     * Handle account deletion
     */
    function handleAccountDeletion() {
        if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            return;
        }
        
        if (!confirm('This will permanently delete all your data. Are you absolutely sure?')) {
            return;
        }
        
        // Clear localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.clear();
        
        showToast('Account deleted successfully', 'success');
        
        // Redirect to login page
        setTimeout(() => {
            window.location.href = '/login';
        }, 2000);
    }
    
    /**
     * Show toast notification
     */
    function showToast(message, type = 'info') {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        // Add styles
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            font-size: 14px;
            font-weight: 500;
        `;
        
        document.body.appendChild(toast);
        
        // Remove after 3 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 3000);
    }
});

// Add logout functionality
document.addEventListener('DOMContentLoaded', function() {
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
});
