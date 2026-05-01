const ACCESS_RANK = {
  P1: 1,
  P2: 2,
  P3: 3
}

export function hasRequiredAccessLevel(userLevel, requiredLevel) {
  if (!userLevel || !requiredLevel) return false
  return ACCESS_RANK[userLevel] >= ACCESS_RANK[requiredLevel]
}

export function isAdminRole(role) {
  return role === 'super_admin' || role === 'bank_admin'
}