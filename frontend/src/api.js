// Base API URL: Points to https://api.santheribhat.com (overrideable via VITE_API_URL)
export const BACKEND_HOST = (import.meta.env.VITE_API_URL || 'https://api.santheribhat.com').replace(/\/+$/, '');
export const API_BASE = `${BACKEND_HOST}/api`;

export function getImageUrl(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  if (url.startsWith('/uploads/')) {
    return `${BACKEND_HOST}${url}`;
  }
  return url;
}

export async function fetchPosts(category = '', search = '', includeDrafts = false) {
  const params = new URLSearchParams();
  if (category && category.toLowerCase() !== 'all') {
    params.append('category', category);
  }
  if (search) {
    params.append('search', search);
  }
  if (includeDrafts) {
    params.append('include_drafts', 'true');
  }
  
  const res = await fetch(`${API_BASE}/posts?${params.toString()}`);
  if (!res.ok) {
    throw new Error('Failed to fetch posts');
  }
  return res.json();
}

export async function fetchPost(slugOrId) {
  const res = await fetch(`${API_BASE}/posts/${slugOrId}`);
  if (!res.ok) {
    throw new Error('Post not found');
  }
  return res.json();
}

export async function createPost(postData) {
  const res = await fetch(`${API_BASE}/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(postData),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to create post');
  }
  return res.json();
}

export async function updatePost(postId, postData) {
  const res = await fetch(`${API_BASE}/posts/${postId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(postData),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to update post');
  }
  return res.json();
}

export async function deletePost(postId) {
  const res = await fetch(`${API_BASE}/posts/${postId}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    throw new Error('Failed to delete post');
  }
  return true;
}

export async function uploadPicture(file) {
  const formData = new FormData();
  formData.append('file', file);
  
  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to upload picture');
  }
  const data = await res.json();
  if (data.url && data.url.startsWith('/') && BACKEND_HOST) {
    data.url = `${BACKEND_HOST}${data.url}`;
  }
  return data;
}

export async function fetchSystemStatus() {
  const res = await fetch(`${API_BASE}/status`);
  if (!res.ok) {
    return { is_neon: false, database_type: 'Unknown', url_configured: false, total_posts: 0 };
  }
  return res.json();
}

export async function subscribeToNewsletter(email) {
  const res = await fetch(`${API_BASE}/subscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.detail || 'Failed to subscribe');
  }
  return data;
}

export async function fetchSubscribers() {
  const res = await fetch(`${API_BASE}/subscribers`);
  if (!res.ok) {
    throw new Error('Failed to fetch subscribers');
  }
  return res.json();
}

export async function notifySubscribersManual(postId) {
  const res = await fetch(`${API_BASE}/posts/${postId}/notify-subscribers`, {
    method: 'POST',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.detail || 'Failed to notify subscribers');
  }
  return data;
}

export async function sendTestEmail(email) {
  const res = await fetch(`${API_BASE}/subscribers/test-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.detail || 'Failed to send test email');
  }
  return data;
}

// ==============================================================================
// FIELD NOTES API
// ==============================================================================

export async function fetchNotes() {
  const res = await fetch(`${API_BASE}/notes`);
  if (!res.ok) {
    throw new Error('Failed to fetch notes');
  }
  return res.json();
}

export async function createNote(noteData) {
  const res = await fetch(`${API_BASE}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(noteData),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.detail || 'Failed to create note');
  }
  return data;
}

export async function updateNote(noteId, noteData) {
  const res = await fetch(`${API_BASE}/notes/${noteId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(noteData),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.detail || 'Failed to update note');
  }
  return data;
}

export async function deleteNote(noteId) {
  const res = await fetch(`${API_BASE}/notes/${noteId}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    throw new Error('Failed to delete note');
  }
  return true;
}

// ==============================================================================
// ADMIN AUTHENTICATION
// ==============================================================================

export async function verifyAdminPassword(password) {
  const res = await fetch(`${API_BASE}/admin/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.detail || 'Incorrect admin passcode');
  }
  return data;
}



