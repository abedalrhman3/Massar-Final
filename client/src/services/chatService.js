// Chat service - API calls for chat functionality

const API_URL = '/api/chat';

export async function getConversations() {
  const response = await fetch(`${API_URL}/conversations`);
  if (!response.ok) {
    throw new Error('Failed to fetch conversations');
  }
  return response.json();
}

export async function getMessages(conversationId) {
  const response = await fetch(`${API_URL}/messages/${conversationId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch messages');
  }
  return response.json();
}

export async function sendMessage(message) {
  const response = await fetch(`${API_URL}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });
  if (!response.ok) {
    throw new Error('Failed to send message');
  }
  return response.json();
}