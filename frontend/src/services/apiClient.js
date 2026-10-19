const getToken = () => {
  return localStorage.getItem('biteflow_token');
};

export const clearSessionAndRedirect = () => {
  localStorage.removeItem('biteflow_token');
  localStorage.removeItem('biteflow_user');
  if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
    window.location.href = '/login?expired=true';
  }
};

export const apiClient = async (endpoint, options = {}) => {
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(endpoint, config);

    // 401 Unauthorized handling: session expired or invalid token
    if (response.status === 401) {
      clearSessionAndRedirect();
      const error = new Error('Session expired or unauthorized. Please log in again.');
      error.statusCode = 401;
      throw error;
    }

    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = { message: await response.text() };
    }

    // Manual res.ok check as required by Section 14 Week 3
    if (!response.ok) {
      const error = new Error(data.message || `Request failed with status ${response.status}`);
      error.statusCode = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    if (err.name === 'AbortError') {
      throw err; // Let caller's abort controller handle this
    }
    throw err;
  }
};
