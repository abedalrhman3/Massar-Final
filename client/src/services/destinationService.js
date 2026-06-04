// Destination service - API calls for destinations management

const API_URL = '/api/destinations';

export async function getDestinations() {
  const response = await fetch(API_URL);
  if (!response.ok) {
    throw new Error('Failed to fetch destinations');
  }
  return response.json();
}

export async function addDestination(destination) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(destination),
  });
  if (!response.ok) {
    throw new Error('Failed to add destination');
  }
  return response.json();
}

export async function updateDestination(id, destination) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(destination),
  });
  if (!response.ok) {
    throw new Error('Failed to update destination');
  }
  return response.json();
}

export async function deleteDestination(id) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete destination');
  }
  return response.json();
}