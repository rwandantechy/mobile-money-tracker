document.addEventListener('DOMContentLoaded', () => {
  const otpInputs = document.querySelectorAll('.otp-input');
  const otpForm = document.getElementById('otpForm');
  const resendBtn = document.getElementById('resendBtn');
  const timerElement = document.getElementById('timer');
  const otpMessage = document.getElementById('otp-message');

  // Helper: Get email from URL
  function getEmailFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('email');
  }

  // OTP input navigation
  otpInputs.forEach((input, idx) => {
    input.addEventListener('input', (e) => {
      if (e.target.value.length === 1 && idx < otpInputs.length - 1) {
        otpInputs[idx + 1].focus();
      }
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !e.target.value && idx > 0) {
        otpInputs[idx - 1].focus();
      }
    });
    input.addEventListener('paste', (e) => {
      e.preventDefault();
      const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
      pasted.split('').forEach((char, i) => {
        if (otpInputs[i]) otpInputs[i].value = char;
      });
      if (otpInputs[pasted.length - 1]) otpInputs[pasted.length - 1].focus();
    });
  });

  // Timer logic
  let timer, timeLeft;
  function startTimer(duration = 120) {
    timeLeft = duration;
    resendBtn.disabled = true;
    updateTimer();
    timer = setInterval(() => {
      timeLeft--;
      updateTimer();
      if (timeLeft <= 0) {
        clearInterval(timer);
        resendBtn.disabled = false;
      }
    }, 1000);
  }
  function updateTimer() {
    if (timerElement) {
      const min = String(Math.floor(timeLeft / 60)).padStart(2, '0');
      const sec = String(timeLeft % 60).padStart(2, '0');
      timerElement.textContent = `${min}:${sec}`;
    }
  }

  // Initial timer start
  startTimer();

  // OTP form submit
  if (otpForm) {
    otpForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const otp = Array.from(otpInputs).map(i => i.value).join('');
      const email = getEmailFromURL();
      otpMessage.textContent = '';
      otpMessage.className = 'otp-message';

      if (otp.length !== 6) {
        otpMessage.textContent = 'Please enter the 6-digit code.';
        otpMessage.classList.add('error');
        return;
      }

      try {
        const res = await fetch('/api/auth/verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, otp })
        });
        const data = await res.json();
        if (res.ok) {
          otpMessage.textContent = 'Verification successful! Redirecting...';
          otpMessage.classList.add('success');
          setTimeout(() => window.location.replace('/login'), 1500);
        } else {
          otpMessage.textContent = data.message || 'Invalid or expired OTP.';
          otpMessage.classList.add('error');
        }
      } catch (err) {
        otpMessage.textContent = 'Network error. Please try again.';
        otpMessage.classList.add('error');
      }
    });
  }

  // Resend OTP
  if (resendBtn) {
    resendBtn.addEventListener('click', async () => {
      const email = getEmailFromURL();
      otpMessage.textContent = '';
      otpMessage.className = 'otp-message';
      resendBtn.disabled = true;
      try {
        const res = await fetch('/api/auth/resend-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        const data = await res.json();
        if (res.ok) {
          otpMessage.textContent = 'A new OTP has been sent to your email.';
          otpMessage.classList.add('success');
          startTimer();
        } else {
          otpMessage.textContent = data.message || 'Failed to resend OTP.';
          otpMessage.classList.add('error');
          resendBtn.disabled = false;
        }
      } catch (err) {
        otpMessage.textContent = 'Network error. Please try again.';
        otpMessage.classList.add('error');
        resendBtn.disabled = false;
      }
    });
  }
});
