(function (window) {
  'use strict';

  const USERS_KEY = 'users';
  const CURRENT_KEY = 'currentUser';

  function getUsers() {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  }

  function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  function addUser(user) {
    user.email = user.email.toLowerCase();
    const users = getUsers();

    if (users.some(u => u.email === user.email)) {
      return { success: false, error: 'Email déjà utilisé' };
    }

    users.push(user);
    saveUsers(users);
    return { success: true };
  }

  function login(email, password) {
    const users = getUsers();
    const user = users.find(u => u.email === email.toLowerCase());

    if (!user) {
      return { success: false, error: 'Utilisateur introuvable' };
    }

    if (user.password !== password) {
      return { success: false, error: 'Mot de passe incorrect' };
    }

    const currentUser = {
      email: user.email,
      name: user.name
    };

    localStorage.setItem(CURRENT_KEY, JSON.stringify(currentUser));

    // ✅ REDIRECTION OK
    window.location.href = 'dashboard.html';

    return { success: true };
  }

  function logout() {
    localStorage.removeItem(CURRENT_KEY);
    window.location.href = 'index.html';
  }

  function getCurrentUser() {
    return JSON.parse(localStorage.getItem(CURRENT_KEY));
  }

  window.Auth = {
    addUser,
    login,
    logout,
    getCurrentUser
  };

})(window);
