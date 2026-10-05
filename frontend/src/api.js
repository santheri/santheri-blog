// Helper utilities for interacting with FastAPI Backend & Neon.tech DB

const API_BASE = '/api';

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
  return res.json();
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


