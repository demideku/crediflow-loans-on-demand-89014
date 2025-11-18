import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { TrendingUp, LogOut, User, Shield, Bell, Menu, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdminRole(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdminRole(session.user.id);
      } else {
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminRole = async (userId) => {
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .single();
    
    setIsAdmin(!!data);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setMobileMenuOpen(false);
    navigate('/');
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <nav className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border shadow-sm">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2" onClick={closeMobileMenu}>
            <div className="p-2 bg-gradient-to-br from-primary to-accent rounded-lg">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              CrediFlow
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link 
              to="/calculator"
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              Calculator
            </Link>
            <Link 
              to="/apply"
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              Apply
            </Link>
            {user && (
              <>
                <Link 
                  to="/my-applications"
                  className="text-foreground hover:text-primary transition-colors font-medium"
                >
                  My Applications
                </Link>
                <Link 
                  to="/notifications"
                  className="text-foreground hover:text-primary transition-colors font-medium"
                >
                  Notifications
                </Link>
              </>
            )}
            <Link 
              to="/about"
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              About
            </Link>
          </div>

          {/* Desktop Auth Section */}
          <div className="hidden md:block">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <User className="w-4 h-4" />
                    Account
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem disabled className="text-xs text-muted-foreground">
                    {user.email}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {isAdmin && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="flex items-center gap-2 cursor-pointer">
                          <Shield className="w-4 h-4" />
                          Admin Portal
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem onClick={handleSignOut} className="flex items-center gap-2 cursor-pointer text-destructive">
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/auth">
                  <Button variant="ghost">
                    Sign In
                  </Button>
                </Link>
                <Link to="/apply">
                  <Button>
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-foreground hover:text-primary transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-lg absolute left-0 right-0 top-16 shadow-lg">
            <div className="container mx-auto px-4 py-4 space-y-4">
              <Link 
                to="/calculator"
                className="block py-3 px-4 text-foreground hover:text-primary hover:bg-muted/50 rounded-lg transition-colors font-medium"
                onClick={closeMobileMenu}
              >
                Calculator
              </Link>
              <Link 
                to="/apply"
                className="block py-3 px-4 text-foreground hover:text-primary hover:bg-muted/50 rounded-lg transition-colors font-medium"
                onClick={closeMobileMenu}
              >
                Apply
              </Link>
              {user && (
                <>
                  <Link 
                    to="/my-applications"
                    className="block py-3 px-4 text-foreground hover:text-primary hover:bg-muted/50 rounded-lg transition-colors font-medium"
                    onClick={closeMobileMenu}
                  >
                    My Applications
                  </Link>
                  <Link 
                    to="/notifications"
                    className="block py-3 px-4 text-foreground hover:text-primary hover:bg-muted/50 rounded-lg transition-colors font-medium"
                    onClick={closeMobileMenu}
                  >
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4" />
                      Notifications
                    </div>
                  </Link>
                </>
              )}
              <Link 
                to="/about"
                className="block py-3 px-4 text-foreground hover:text-primary hover:bg-muted/50 rounded-lg transition-colors font-medium"
                onClick={closeMobileMenu}
              >
                About
              </Link>
              
              {/* Mobile Auth Section */}
              <div className="pt-4 border-t border-border space-y-3">
                {user ? (
                  <>
                    <div className="px-4 py-2 text-sm text-muted-foreground">
                      {user.email}
                    </div>
                    {isAdmin && (
                      <Link 
                        to="/admin"
                        className="flex items-center gap-2 py-3 px-4 text-foreground hover:text-primary hover:bg-muted/50 rounded-lg transition-colors font-medium"
                        onClick={closeMobileMenu}
                      >
                        <Shield className="w-4 h-4" />
                        Admin Portal
                      </Link>
                    )}
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2 py-3 px-4 text-destructive hover:bg-destructive/10 rounded-lg transition-colors font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/auth" onClick={closeMobileMenu}>
                      <Button variant="ghost" className="w-full">
                        Sign In
                      </Button>
                    </Link>
                    <Link to="/apply" onClick={closeMobileMenu}>
                      <Button className="w-full">
                        Get Started
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
