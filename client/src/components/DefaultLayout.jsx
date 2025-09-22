import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { 
  Menu, 
  Code, 
  Home, 
  Users, 
  Settings, 
  LogOut, 
  Plus,
  ClipboardList,
  Trophy,
  UserCheck
} from 'lucide-react'

const DefaultLayout = ({ children, userRole = 'participant' }) => {
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const getNavigationItems = () => {
    const navItems = {
      admin: [
        { label: 'Dashboard', icon: Home, path: '/admin' },
        { label: 'Create Event', icon: Plus, path: '/admin' }
      ],
      coordinator: [
        { label: 'My Teams', icon: Users, path: '/coordinator' },
        { label: 'Project Assignment', icon: ClipboardList, path: '/coordinator' }
      ],
      participant: [
        { label: 'Project', icon: Code, path: '/participant' },
        { label: 'Submissions', icon: ClipboardList, path: '/participant' }
      ],
      evaluator: [
        { label: 'Submissions', icon: ClipboardList, path: '/evaluator' },
        { label: 'Scoreboard', icon: Trophy, path: '/evaluator' }
      ]
    }
    return navItems[userRole] || []
  }

  const handleLogout = () => {
    navigate('/')
  }

  const getUserInitials = () => {
    return userRole.charAt(0).toUpperCase() + userRole.charAt(1).toUpperCase()
  }

  const NavigationItems = ({ mobile = false }) => {
    const items = getNavigationItems()
    
    return (
      <div className={`flex ${mobile ? 'flex-col space-y-2' : 'space-x-6'}`}>
        {items.map((item) => (
          <Button
            key={item.label}
            variant="ghost"
            className={`${mobile ? 'justify-start' : ''} text-gray-600 hover:text-gray-900`}
            onClick={() => {
              navigate(item.path)
              if (mobile) setIsMobileMenuOpen(false)
            }}
          >
            <item.icon className="w-4 h-4 mr-2" />
            {item.label}
          </Button>
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/20">
      {/* Top Navigation */}
      <nav className="bg-white/80 backdrop-blur-xl shadow-lg border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Title */}
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                <div className="relative p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                  <Code className="w-6 h-6 text-white" />
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl blur-lg opacity-50" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">
                    Hackathon Portal
                  </h1>
                  <p className="text-xs text-gray-500 capitalize font-medium">
                    {userRole} Dashboard
                  </p>
                </div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <NavigationItems />
              
              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-blue-50 transition-colors">
                    <Avatar className="h-10 w-10 ring-2 ring-blue-100 hover:ring-blue-200 transition-all">
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-white/95 backdrop-blur-xl border-white/20 shadow-xl" align="end">
                  <DropdownMenuItem className="hover:bg-blue-50 transition-colors">
                    <UserCheck className="mr-2 h-4 w-4 text-blue-600" />
                    <span className="capitalize font-medium">{userRole}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-gray-50 transition-colors">
                    <Settings className="mr-2 h-4 w-4 text-gray-600" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="hover:bg-red-50 text-red-600 transition-colors">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="hover:bg-blue-50 transition-colors">
                    <Menu className="h-6 w-6 text-gray-700" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-72 bg-white/95 backdrop-blur-xl border-white/20">
                  <div className="flex flex-col space-y-6 mt-6">
                    <div className="flex items-center space-x-4 pb-6 border-b border-gray-200">
                      <Avatar className="h-12 w-12 ring-2 ring-blue-100">
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold text-lg">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold capitalize text-gray-900">{userRole}</p>
                        <p className="text-sm text-gray-500">Dashboard</p>
                      </div>
                    </div>
                    
                    <NavigationItems mobile />
                    
                    <div className="pt-6 border-t border-gray-200">
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-red-600 hover:bg-red-50 transition-colors"
                        onClick={handleLogout}
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Log out
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        {children}
      </main>
    </div>
  )
}

export default DefaultLayout