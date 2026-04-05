import logo from "@/assets/afromeet-logo.png";
import { Button } from "@/components/ui/button";
import { Video, Menu, X } from "lucide-react";
import { useState } from "react";

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container flex items-center justify-between h-16">
        <div className="flex items-center gap-2">
          <img src={logo} alt="Afromeet" className="h-10" />
        </div>

        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</a>
          <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
          <a href="#about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">About</a>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" size="sm">Sign In</Button>
          <Button size="sm" className="gradient-hero border-0">
            <Video className="w-4 h-4 mr-1" />
            Start a Meeting
          </Button>
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
            <Button variant="ghost" size="sm" className="w-full">Sign In</Button>
            <Button size="sm" className="w-full gradient-hero border-0">Start a Meeting</Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
