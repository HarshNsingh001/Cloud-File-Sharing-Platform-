import { Link, useLocation } from 'react-router-dom';
import { Files, Share2, Activity, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ isOpen }) {
  const location = useLocation();
  const { logout, user } = useAuth();

  const menuItems = [
    { path: '/dashboard', icon: Files, label: 'My Files' },
    { path: '/shared', icon: Share2, label: 'Shared Files' },
    { path: '/audit', icon: Activity, label: 'Audit Logs', adminOnly: true },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  const filteredItems = menuItems.filter(
    item => !item.adminOnly || user?.role === 'admin'
  );

  return (
    
      
        
          {isOpen ? 'CloudShare' : 'CS'}
        
      

      
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            
              
              {isOpen && {item.label}}
            
          );
        })}
      

      
        
          
          {isOpen && Logout}
        
      
    
  );
}