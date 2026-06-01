// Clear all user data - run this in browser console
localStorage.removeItem('nova_users');
localStorage.removeItem('nova_active_user');
// Clear all individual user states
Object.keys(localStorage).forEach(key => {
  if (key.startsWith('nova_user_') || key === 'nova_state') {
    localStorage.removeItem(key);
  }
});
console.log('All user profiles cleared!');
location.reload();
