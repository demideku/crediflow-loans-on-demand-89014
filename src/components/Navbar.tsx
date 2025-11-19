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
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
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

  const checkAdminRole = async (userId: string) => {
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
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border shadow-sm">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-primary to-accent rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              CrediFlow
            </span>
          </Link>

          {/* Navigation */}
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

          {/* Mobile Menu */}
          <div className="md:hidden flex items-center gap-2">
            {user && (
              <Link to="/notifications">
                <Button variant="ghost" size="icon">
                  <Bell className="w-5 h-5" />
                </Button>
              </Link>
            )}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[350px]">
                <nav className="flex flex-col gap-4 mt-8">
                  <Link 
                    to="/calculator"
                    className="text-lg font-medium hover:text-primary transition-colors p-3 rounded-lg hover:bg-accent"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Calculator
                  </Link>
                  <Link 
                    to="/apply"
                    className="text-lg font-medium hover:text-primary transition-colors p-3 rounded-lg hover:bg-accent"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Apply
                  </Link>
                  {user && (
                    <>
                      <Link 
                        to="/my-applications"
                        className="text-lg font-medium hover:text-primary transition-colors p-3 rounded-lg hover:bg-accent"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        My Applications
                      </Link>
                      <Link 
                        to="/notifications"
                        className="text-lg font-medium hover:text-primary transition-colors p-3 rounded-lg hover:bg-accent"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Notifications
                      </Link>
                    </>
                  )}
                  <Link 
                    to="/about"
                    className="text-lg font-medium hover:text-primary transition-colors p-3 rounded-lg hover:bg-accent"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    About
                  </Link>
                  
                  <div className="border-t pt-4 mt-4">
                    {user ? (
                      <>
                        <div className="text-sm text-muted-foreground mb-4 px-3">{user.email}</div>
                        {isAdmin && (
                          <Link 
                            to="/admin"
                            className="flex items-center gap-2 text-lg font-medium hover:text-primary transition-colors p-3 rounded-lg hover:bg-accent mb-2"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <Shield className="w-5 h-5" />
                            Admin Portal
                          </Link>
                        )}
                        <Button 
                          variant="outline" 
                          className="w-full gap-2 text-base" 
                          onClick={() => {
                            handleSignOut();
                            setMobileMenuOpen(false);
                          }}
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </Button>
                      </>
                    ) : (
                      <div className="space-y-2">
                        <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                          <Button variant="outline" className="w-full text-base">
                            Sign In
                          </Button>
                        </Link>
                        <Link to="/apply" onClick={() => setMobileMenuOpen(false)}>
                          <Button className="w-full text-base">
                            Get Started
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
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
                  <DropdownMenuItem 
                    onClick={handleSignOut}
                    className="cursor-pointer text-destructive focus:text-destructive"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/auth">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link to="/apply">
                  <Button>Get Started</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;