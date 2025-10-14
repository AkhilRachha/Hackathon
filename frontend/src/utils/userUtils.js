import axiosInstance from '@/lib/axiosInstance';

// Utility function to refresh user data from server
export const refreshUserData = async () => {
  try {
    const response = await axiosInstance.get('/auth/me');
    const userData = response.data.user;
    
    // Update localStorage with fresh data
    localStorage.setItem('userRole', userData.role_name);
    localStorage.setItem('userId', userData._id);
    localStorage.setItem('userName', userData.user_name);
    
    if (userData.current_hackathon) {
      localStorage.setItem('currentHackathonId', userData.current_hackathon);
    } else {
      localStorage.removeItem('currentHackathonId');
    }
    
    return userData;
  } catch (error) {
    console.error('Failed to refresh user data:', error);
    throw error;
  }
};

// Check if user role has changed and redirect accordingly
export const checkRoleAndRedirect = (expectedRole, currentPath) => {
  const currentRole = localStorage.getItem('userRole');
  
  if (currentRole !== expectedRole) {
    // Role has changed, redirect to appropriate page
    if (currentRole === 'participant') {
      window.location.href = '/participant';
    } else if (currentRole === 'coordinator') {
      window.location.href = '/coordinator';
    } else if (currentRole === 'evaluator') {
      window.location.href = '/evaluator-dashboard';
    } else if (currentRole === 'admin') {
      window.location.href = '/admin';
    } else {
      window.location.href = '/login';
    }
    return true; // Role changed, redirect initiated
  }
  return false; // No role change
};