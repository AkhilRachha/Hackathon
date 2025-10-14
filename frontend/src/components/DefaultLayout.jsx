import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Menu, Code, Home, Users, LogOut, Plus, ClipboardList, Trophy, UserCheck, Eye } from 'lucide-react';

const DefaultLayout = ({ children, userRole = 'participant' }) => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const userName = localStorage.getItem('userName') || userRole;

  // --- ⬇️  FIXED HERE: Added all correct navigation links for each role ⬇️ ---
  const getNavigationItems = () => {
    const navItems = {
      admin: [
        { label: 'Dashboard', icon: Home, path: '/admin' },
        { label: 'Create Event', icon: Plus, path: '/admin/create-hackathon' },
        { label: 'View Events', icon: Eye, path: '/admin/view-hackathon' },
        { label: 'Manage Titles', icon: ClipboardList, path: '/admin/titles' },
        { label: 'Winners', icon: Trophy, path: '/admin/hackathon-winners' },
      ],
      coordinator: [
        { label: 'Dashboard', icon: Home, path: '/coordinator?view=dashboard' },
        { label: 'Register Team', icon: Users, path: '/coordinator?view=register' },
      ],
      participant: [
        { label: 'Dashboard', icon: Home, path: '/participant' },
      ],
      evaluator: [
        { label: 'Dashboard', icon: Home, path: '/evaluator-dashboard' },
      ]
    };
    return navItems[userRole] || [];
  };
  // --- ⬆️ END OF FIX ⬆️ ---

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const getUserInitials = () => {
    return userName.substring(0, 2).toUpperCase();
  };

  const NavigationLinks = ({ mobile = false }) => {
    const items = getNavigationItems();
    const baseClasses = "text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors";
    const mobileClasses = "justify-start w-full text-left p-4";
    const desktopClasses = "px-3 py-2";

    return (
      <div className={`flex items-center ${mobile ? 'flex-col space-y-1 w-full' : 'space-x-1'}`}>
        {items.map((item) => (
          <Button
            key={item.label}
            variant="ghost"
            className={`${baseClasses} ${mobile ? mobileClasses : desktopClasses}`}
            onClick={() => {
              navigate(item.path);
              if (mobile) setIsMobileMenuOpen(false);
            }}
          >
            <item.icon className="w-4 h-4 mr-2" />
            {item.label}
          </Button>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white/80 backdrop-blur-xl shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-3">
                <div className="relative p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                    <Code className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-gray-800">Hackathon Portal</h1>
                    <p className="text-xs text-gray-500 capitalize font-medium">{userRole} Dashboard</p>
                </div>
            </Link>

            <div className="hidden md:flex items-center space-x-4">
              <NavigationLinks />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">{getUserInitials()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuItem>
                    <UserCheck className="mr-2 h-4 w-4" />
                    <span>{userName}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="md:hidden">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon"><Menu className="h-6 w-6" /></Button>
                </SheetTrigger>
                <SheetContent>
                    <div className="mt-8 flex flex-col h-full">
                      <NavigationLinks mobile />
                      <div className="mt-auto mb-8">
                        <Button variant="ghost" onClick={handleLogout} className="w-full justify-start text-red-600">
                            <LogOut className="w-4 h-4 mr-2" /> Log out
                        </Button>
                      </div>
                    </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      <main>
        {children}
      </main>
    </div>
  );
};

export default DefaultLayout;