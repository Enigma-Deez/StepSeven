export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    // This error triggers if you forgot the Provider in App.js
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};