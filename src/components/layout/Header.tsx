import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Settings, Menu, X, LogIn, LogOut, Sun, Moon, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error('Erro ao sair');
      return;
    }
    toast.success('Você saiu da sua conta');
    navigate('/');
  };

  const userInitials = user?.email?.slice(0, 2).toUpperCase() || 'U';

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-[70px] sm:h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3 group">
            <div className="flex items-center gap-2 sm:gap-4">
              <img
                src="https://hs.unit.br/hs-fs/hubfs/marca-fits-branca.png"
                alt="FITS"
                className="h-8 sm:h-7 w-auto object-contain max-w-[80px] sm:max-w-none"
                style={{ filter: 'var(--logo-filter)' }}
              />
              <div className="w-px h-6 bg-border/60" />
              <img
                src="https://hs.unit.br/hs-fs/hubfs/unit-pe-marca-w.png"
                alt="UNIT PE"
                className="h-8 sm:h-7 w-auto object-contain max-w-[80px] sm:max-w-none"
                style={{ filter: 'var(--logo-filter)' }}
              />
              <div className="w-px h-6 bg-border/60" />
              <img
                src="https://hs.unit.br/hs-fs/hubfs/a-web-mkt/MARCA_UNIT.png"
                alt="UNIT"
                className="h-8 sm:h-7 w-auto object-contain max-w-[80px] sm:max-w-none"
                style={{ filter: 'var(--logo-filter)' }}
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Link to="/">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 px-3 rounded-lg text-sm font-medium transition-all",
                  isActive('/') && "bg-primary/10 text-primary"
                )}
              >
                Calendário
              </Button>
            </Link>

            {isAdmin && (
              <Link to="/admin">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-8 px-3 rounded-lg text-sm font-medium transition-all",
                    isActive('/admin') && "bg-primary/10 text-primary"
                  )}
                >
                  <Settings className="w-3.5 h-3.5 mr-1.5" />
                  Admin
                </Button>
              </Link>
            )}

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-8 w-8 rounded-lg"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </Button>

            {/* Auth Section */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 px-2 rounded-lg">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-[10px] bg-primary text-primary-foreground">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium truncate">{user.email}</p>
                    {isAdmin && (
                      <p className="text-xs text-primary">Administrador</p>
                    )}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive cursor-pointer">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button size="sm" className="h-8 px-4 rounded-lg text-sm font-medium">
                  <LogIn className="w-3.5 h-3.5 mr-1.5" />
                  Entrar
                </Button>
              </Link>
            )}
          </nav>

          {/* Mobile */}
          <div className="flex md:hidden items-center gap-1">
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-8 w-8 rounded-lg">
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-[10px] bg-primary text-primary-foreground">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium truncate">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive cursor-pointer">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                  <LogIn className="w-4 h-4" />
                </Button>
              </Link>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav className="md:hidden py-3 space-y-1 animate-in fade-in slide-in-from-top-2 duration-200">
            <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>
              <Button
                variant={isActive('/') ? 'secondary' : 'ghost'}
                className="w-full justify-start h-10 rounded-lg"
              >
                <LayoutGrid className="w-4 h-4 mr-2" />
                Calendário
              </Button>
            </Link>

            {isAdmin && (
              <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)}>
                <Button
                  variant={isActive('/admin') ? 'secondary' : 'ghost'}
                  className="w-full justify-start h-10 rounded-lg"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Administração
                </Button>
              </Link>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
