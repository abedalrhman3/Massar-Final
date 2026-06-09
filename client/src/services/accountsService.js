// accountsService.js — rewritten to use real API endpoints from @/api/auth

import client from '@/api/client';

// ==================== STATS ====================
// Derived client-side from /api/auth/users — no dedicated stats endpoints exist

export async function getAccountStats() {
  const res = await client.get('/auth/users');
  const users = res.data.data ?? res.data.users ?? res.data ?? [];
  const active = users.filter(u => !u.isBanned).length;
  const banned = users.filter(u => u.isBanned).length;
  return { active, suspended: 0, banned, reported: banned };
}

export async function getBanHistoryStats() {
  const res = await client.get('/auth/users');
  const users = res.data.data ?? res.data.users ?? res.data ?? [];
  const banned = users.filter(u => u.isBanned);
  return {
    total: banned.length,
    thisWeek: banned.length,
    active: banned.length,
  };
}

// ==================== ACCOUNTS ====================

export async function getAccounts(filters = {}) {
  const res = await client.get('/auth/users');
  let users = res.data.data ?? res.data.users ?? res.data ?? [];

  if (filters.status && filters.status !== 'all') {
    users = users.filter(u =>
      filters.status === 'banned' ? u.isBanned : !u.isBanned
    );
  }
  if (filters.search) {
    const q = filters.search.toLowerCase();
    users = users.filter(u =>
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q)
    );
  }

  return { data: users };
}

export async function getReportedAccounts(search = '') {
  const res = await client.get('/auth/users');
  let users = res.data.data ?? res.data.users ?? res.data ?? [];
  // Reported = banned users (no separate reports collection yet)
  users = users.filter(u => u.isBanned);

  if (search) {
    const q = search.toLowerCase();
    users = users.filter(u =>
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q)
    );
  }

  return { data: users };
}

// ==================== BAN HISTORY ====================

export async function getBanHistory(search = '') {
  const res = await client.get('/auth/users');
  let users = res.data.data ?? res.data.users ?? res.data ?? [];
  users = users.filter(u => u.isBanned);

  if (search) {
    const q = search.toLowerCase();
    users = users.filter(u =>
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q)
    );
  }

  // Shape each record as a ban-history entry
  return {
    data: users.map(u => ({
      id: u._id,
      username: u.name,
      email: u.email,
      avatar: u.profilePicture || null,
      bannedAt: u.updatedAt ?? u.createdAt,
      reason: 'N/A',   // no reason field stored yet
    }))
  };
}

// ==================== ACTIONS ====================
// All routed through the real toggleBanUser / deleteUser endpoints

export async function suspendAccount(id) {
  return client.put(`/auth/users/${id}/ban`);
}

export async function reactivateAccount(id) {
  return client.put(`/auth/users/${id}/ban`);
}

export async function banAccount(id) {
  return client.put(`/auth/users/${id}/ban`);
}

export async function unbanAccount(id) {
  return client.put(`/auth/users/${id}/ban`);
}

export async function deleteAccount(id) {
  return client.delete(`/auth/users/${id}`);
}

// clearAccountFlags has no backend endpoint yet — no-op that resolves cleanly
export async function clearAccountFlags() {
  return Promise.resolve({ success: true });
}