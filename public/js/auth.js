// Add loading class to body to hide content until authentication check completes
document.body.classList.add('auth-loading');

/**
 * Checks user authentication state and redirects accordingly:
 * - If logged in and on a public page → redirect to app.
 * - If not logged in and on a protected page → redirect to login.
 */
function checkAuth() {
    const token = localStorage.getItem('token');
    const path = window.location.pathname;

    // Remove loading class first
    document.body.classList.remove('auth-loading');

    if (token) {
        // If we have a token and we're on a public page, redirect to app
        if (
            path === '/' ||
            path === '/login' || 
            path === '/register' || 
            path === '/otp-verification'
        ) {
            window.location.replace('/dashboard');
        }
    } else {
        // If no token and we're on a protected page, redirect to login
        if (path === '/app' || path === '/dashboard') {
            window.location.replace('/login');
        }
    }
}

document.addEventListener('DOMContentLoaded', checkAuth);

/**
 * Starts a 5-minute countdown timer and displays it.
 * Enables 'Resend OTP' button when time expires.
 */
function startOTPTimer() {
    const timerElement = document.getElementById('timer');
    if (!timerElement) return;

    let timeLeft = 5 * 60; // 5 minutes

    const timer = setInterval(() => {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        if (timeLeft <= 0) {
            clearInterval(timer);
            timerElement.textContent = '00:00';
            document.getElementById('resendOtp').style.display = 'inline';
        }

        timeLeft--;
    }, 1000);
}

/**
 * Handles OTP input navigation:
 * - Auto-focuses next field on input.
 * - Moves back on backspace.
 * - Supports pasting full OTP.
 */
function setupOTPInputs() {
    const otpInputs = document.querySelectorAll('.otp-input');
    if (!otpInputs.length) return;

    otpInputs.forEach((input, index) => {
        input.addEventListener('input', (e) => {
            if (e.target.value.length === 1 && index < otpInputs.length - 1) {
                otpInputs[index + 1].focus();
            }
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !e.target.value && index > 0) {
                otpInputs[index - 1].focus();
            }
        });

        input.addEventListener('paste', (e) => {
            e.preventDefault();
            const pastedData = e.clipboardData.getData('text').slice(0, 6);
            if (/^\d+$/.test(pastedData)) {
                pastedData.split('').forEach((digit, i) => {
                    if (otpInputs[i]) otpInputs[i].value = digit;
                });
                if (otpInputs[pastedData.length]) {
                    otpInputs[pastedData.length].focus();
                }
            }
        });
    });
}

/**
 * Handles login form submission.
 * Sends credentials to server and stores auth token on success.
 */
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                // Token is now stored in cookie by the server
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                window.location.replace('/dashboard');
            } else {
                alert(data.message || 'Login failed');
            }
        } catch (err) {
            console.error('Login error:', err);
            alert('Login failed. Please try again.');
        }
    });
}

/**
 * Handles user registration.
 * Sends user data to API, stores it in session storage, and redirects to OTP verification page.
 */
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ firstName, lastName, email, phone, password })
            });

            const data = await response.json();

            if (response.ok) {
                sessionStorage.setItem('pendingRegistration', JSON.stringify({ firstName, lastName, email, phone, password }));
                window.location.replace(`/otp-verification?email=${email}`);
            } else {
                alert(data.message || 'Registration failed');
            }
        } catch (err) {
            console.error('Registration error:', err);
            alert('Registration failed. Please try again.');
        }
    });
}

/**
 * Handles OTP verification:
 * - Reads OTP digits
 * - Sends to server with stored registration data
 * - On success, saves token and redirects to app
 */
const verifyOtpForm = document.getElementById('verifyOtpForm');
if (verifyOtpForm) {
    setupOTPInputs();
    startOTPTimer();

    verifyOtpForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const otpInputs = document.querySelectorAll('.otp-input');
        const otp = Array.from(otpInputs).map(input => input.value).join('');

        try {
            const pendingRegistration = JSON.parse(sessionStorage.getItem('pendingRegistration'));
            if (!pendingRegistration) {
                window.location.replace('/register');
                return;
            }

            const response = await fetch('/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...pendingRegistration, otp })
            });

            const data = await response.json();

            if (response.ok) {
                // Token is now stored in cookie by the server
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                sessionStorage.removeItem('pendingRegistration');
                window.location.replace('/dashboard');
            } else {
                alert(data.message || 'OTP verification failed');
            }
        } catch (err) {
            console.error('OTP verification error:', err);
            alert('OTP verification failed. Please try again.');
        }
    });
}

/**
 * Handles logout functionality
 */
async function logout() {
    try {
        const response = await fetch('/api/auth/logout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        if (response.ok) {
            // Clear local storage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            sessionStorage.clear();
            
            // Redirect to login
            window.location.replace('/login');
        } else {
            console.error('Logout failed');
        }
    } catch (error) {
        console.error('Logout error:', error);
    }
}

// Add logout event listeners
document.addEventListener('DOMContentLoaded', () => {
    const logoutButtons = document.querySelectorAll('.logout-btn, .logout-link');
    logoutButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    });
    
    // Also handle direct logout links (for cases where JavaScript might not work)
    const directLogoutLinks = document.querySelectorAll('a[href="/logout"]');
    directLogoutLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            // Clear localStorage before redirecting
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            sessionStorage.clear();
        });
    });
});

/**
 * Handles resend OTP action:
 * - Triggers resend OTP endpoint
 * - Restarts OTP timer on success
 */
const resendOtpButton = document.getElementById('resendOtp');
if (resendOtpButton) {
    resendOtpButton.addEventListener('click', async (e) => {
        e.preventDefault();
        const pendingRegistration = JSON.parse(sessionStorage.getItem('pendingRegistration'));
        if (!pendingRegistration) {
            window.location.replace('register.html');
            return;
        }

        try {
            const response = await fetch('/api/auth/resend-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: pendingRegistration.email })
            });

            const data = await response.json();

            if (response.ok) {
                alert('New OTP has been sent to your email');
                startOTPTimer();
                resendOtpButton.style.display = 'none';
            } else {
                alert(data.message || 'Failed to resend OTP');
            }
        } catch (err) {
            console.error('Resend OTP error:', err);
            alert('Failed to resend OTP. Please try again.');
        }
    });
}
