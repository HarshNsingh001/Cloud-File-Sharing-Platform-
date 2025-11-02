import { Moon, Sun, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Header({ darkMode, setDarkMode, toggleSidebar }) {
  const { user } = useAuth();

  return (







    <button
      onClick={() => setDarkMode(!darkMode)}
      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
    >
      {darkMode ?  : }




      {user?.username?.charAt(0).toUpperCase()}


      {user?.username}
      {user?.role}





    );
}
