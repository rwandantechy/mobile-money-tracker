// Profile dropdown accessibility and toggle
document.addEventListener('DOMContentLoaded', function () {
  const profileIcon = document.getElementById('profileIcon');
  const profileDropdown = document.getElementById('profileDropdown');

  // Toggle dropdown on click
  profileIcon.addEventListener('click', function (e) {
    e.stopPropagation();
    const expanded = profileIcon.getAttribute('aria-expanded') === 'true';
    profileDropdown.classList.toggle('show');
    profileIcon.setAttribute('aria-expanded', !expanded);
  });

  // Close dropdown on outside click
  document.addEventListener('click', function () {
    profileDropdown.classList.remove('show');
    profileIcon.setAttribute('aria-expanded', 'false');
  });

  // Close dropdown on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      profileDropdown.classList.remove('show');
      profileIcon.setAttribute('aria-expanded', 'false');
    }
  });
});
