import { Building2, LayoutDashboard, Receipt, FileText, Settings, LogOut, Menu, X, Sun, Moon } from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Separator } from './ui/separator';
import { useTheme } from './ThemeProvider';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: any) => void;
  onLogout: () => void;
  user: any;
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({ currentView, onViewChange, onLogout, user, isOpen, onToggle }: SidebarProps) {
  const { theme, toggleTheme } = useTheme();
  
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: Receipt },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      {/* Mobile toggle button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed left-4 top-4 z-50 md:hidden"
        onClick={onToggle}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-border bg-card transition-transform duration-200 ease-in-out md:relative md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center gap-2 border-b border-border p-6">
            <Building2 className="h-6 w-6 text-primary" />
            <h2 className="text-primary">BizLedger AI</h2>
          </div>

          {/* User Info */}
          <div className="border-b border-border p-4">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback>{getInitials(user?.name || 'U')}</AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <p className="truncate">{user?.name}</p>
                <p className="truncate text-muted-foreground">{user?.businessName}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onViewChange(item.id);
                    // Close sidebar on mobile after selection
                    if (window.innerWidth < 768) {
                      onToggle();
                    }
                  }}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
                    currentView === item.id
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-accent'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="border-t border-border p-4 space-y-1">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={toggleTheme}
            >
              {theme === 'light' ? (
                <>
                  <Moon className="mr-3 h-5 w-5" />
                  Dark Mode
                </>
              ) : (
                <>
                  <Sun className="mr-3 h-5 w-5" />
                  Light Mode
                </>
              )}
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={onLogout}
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={onToggle}
        />
      )}
    </>
  );
}
