const path = require('path');

function isActiveAdmin(user) {
  return user?.role === 'admin' &&
    user.isActive !== false &&
    user.isBanned !== true &&
    user.isSuspended !== true &&
    user.isDeleted !== true;
}

function requireAdmin(req, res, next) {
  if (!isActiveAdmin(req.user)) {
    return res.status(403).json({ message: 'Admin access required' });
  }

  res.set('Cache-Control', 'private, no-store');
  return next();
}

function requireAdminPage(req, res, next) {
  if (!isActiveAdmin(req.user)) {
    return res.status(403).sendFile(path.join(__dirname, '../../public/pages/403.html'));
  }

  res.set('Cache-Control', 'private, no-store');
  return next();
}

module.exports = { requireAdmin, requireAdminPage };
