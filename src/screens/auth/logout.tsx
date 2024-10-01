// src/utils/auth.ts

export const logout = () => {
  localStorage.removeItem('authToken');
  window.location.href = '/login'; // Redirect to login page
};