function verifyRoleOfAuthenticatedUser(req, res, next) {
  const { role } = req;
  if (role && role === 'ADMIN_ROLE') {
    return next();
  }
  return res.status(403).send({ error: 'You don\'t have permission to access the resource' });
}

module.exports = verifyRoleOfAuthenticatedUser;
