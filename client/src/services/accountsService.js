// Use relative URL when running through Vite proxy, or full URL if VITE_API_URL is set
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

async function fetchAPI(endpoint, options = {}) {
  const url = API_BASE_URL ? `${API_BASE_URL}${endpoint}` : endpoint;
  const config = {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || 'Request failed');
    }
    return await response.json();
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

// ==================== STATS ====================

export async function getAccountStats() {
  return fetchAPI('/api/accounts/stats');
}

export async function getBanHistoryStats() {
  return fetchAPI('/api/ban-history/stats');
}

// ==================== ACCOUNTS ====================

export async function getAccounts(filters = {}) {
  const params = new URLSearchParams();
  if (filters.status && filters.status !== 'all') params.append('status', filters.status);
  if (filters.tier && filters.tier !== 'all') params.append('tier', filters.tier);
  if (filters.search) params.append('search', filters.search);

  const queryString = params.toString();
  return fetchAPI(`/api/accounts${queryString ? `?${queryString}` : ''}`);
}

export async function getReportedAccounts(search = '') {
  const params = new URLSearchParams();
  if (search) params.append('search', search);

  const queryString = params.toString();
  return fetchAPI(`/api/accounts/reported${queryString ? `?${queryString}` : ''}`);
}

// ==================== BAN HISTORY ====================

export async function getBanHistory(search = '') {
  const params = new URLSearchParams();
  if (search) params.append('search', search);

  const queryString = params.toString();
  return fetchAPI(`/api/ban-history${queryString ? `?${queryString}` : ''}`);
}

// ==================== ACTIONS ====================

export async function suspendAccount(email) {
  return fetchAPI(`/api/accounts/${encodeURIComponent(email)}/suspend`, {
    method: 'POST',
  });
}

export async function reactivateAccount(email) {
  return fetchAPI(`/api/accounts/${encodeURIComponent(email)}/reactivate`, {
    method: 'POST',
  });
}

export async function banAccount(email, reason) {
  return fetchAPI(`/api/accounts/${encodeURIComponent(email)}/ban`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
}

export async function unbanAccount(email) {
  return fetchAPI(`/api/ban-history/${encodeURIComponent(email)}/unban`, {
    method: 'POST',
  });
}

export async function clearAccountFlags(email) {
  return fetchAPI(`/api/accounts/${encodeURIComponent(email)}/clear-flags`, {
    method: 'POST',
  });
}

// ==================== HEALTH CHECK ====================

export async function checkApiHealth() {
  return fetchAPI('/api/health');
}