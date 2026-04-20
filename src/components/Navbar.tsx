import logo from "@/assets/afromeet-logo.png";
import { Button } from "@/components/ui/button";
import { Video, Menu, X, User, LogOut, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const getInitials = (name: string) =>
  name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("") || "?";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { session, profile, user, signOut } = useAuth();
  const navigate = useNavigate();

  const displayName = profile?.display_name ?? user?.email ?? "";

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container flex items-center justify-between h-16">
        <div className="flex items-center gap-2">
          <Link to="/">
            <img src={logo} alt="Afromeet" className="h-10" />
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</a>
          <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
          <a href="#about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">About</a>
        </div>

        <div className="hidden md:flex items-center gap-3">
          {session ? (
            <>
              <Button size="sm" className="gradient-hero border-0" asChild>
                <Link to="/lobby">
                  <Video className="w-4 h-4 mr-1" />
                  Start a Meeting
                </Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-primary">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={profile?.avatar_url ?? undefined} />
                      <AvatarFallback className="gradient-hero text-primary-foreground text-xs font-bold">
                        {getInitials(displayName)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-foreground hidden lg:block max-w-[120px] truncate">
                      {displayName}
                    </span>
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center gap-2 cursor-pointer">
                      <User className="w-4 h-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="flex items-center gap-2 text-destructive focus:text-destructive cursor-pointer"
                    onClick={handleSignOut}
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
              <Button size="sm" className="gradient-hero border-0" asChild>
                <Link to="/signup">
                  <Video className="w-4 h-4 mr-1" />
                  Get Started
                </Link>
              </Button>
            </>
          )}
        </div>

        <button className="md:hidden text-foreground" onClick={() => setOpen(!open)}>
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-background p-4 space-y-3">
          <a href="#features" className="block text-sm font-medium text-muted-foreground">Features</a>
          <a href="#pricing" className="block text-sm font-medium text-muted-foreground">Pricing</a>
          <a href="#about" className="block text-sm font-medium text-muted-foreground">About</a>
          <div className="pt-2 space-y-2">
            {session ? (
              <>
                <Button size="sm" className="w-full gradient-hero border-0" asChild>
                  <Link to="/lobby">Start a Meeting</Link>
                </Button>
                <Button size="sm" variant="ghost" className="w-full" asChild>
                  <Link to="/profile">Profile</Link>
                </Button>
                <Button size="sm" variant="ghost" className="w-full text-destructive" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" className="w-full" asChild>
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button size="sm" className="w-full gradient-hero border-0" asChild>
                  <Link to="/signup">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
