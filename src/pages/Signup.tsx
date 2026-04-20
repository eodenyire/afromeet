import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/afromeet-logo.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const Signup = () => {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password || !displayName.trim()) return;
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { display_name: displayName.trim() },
      },
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    // Create profile row
    if (data.user) {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        display_name: displayName.trim(),
      });
    }

    setLoading(false);
    toast.success("Account created! Please check your email to confirm.");
    navigate("/profile/setup", { replace: true });
  };

  return (
    <div className="min-h-screen bg-meeting-bg flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex justify-center">
          <Link to="/">
            <img src={logo} alt="Afromeet" className="h-12" />
          </Link>
        </div>

        <Card className="bg-meeting-surface border-meeting-border">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl font-display text-meeting-text">Create account</CardTitle>
            <CardDescription className="text-meeting-muted">
              Join Afromeet and start meeting
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="displayName" className="text-meeting-text text-sm">Display name</Label>
                <Input
                  id="displayName"
                  type="text"
                  placeholder="Your name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  className="bg-meeting-bg border-meeting-border text-meeting-text placeholder:text-meeting-muted"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-meeting-text text-sm">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-meeting-bg border-meeting-border text-meeting-text placeholder:text-meeting-muted"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-meeting-text text-sm">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  required
                  className="bg-meeting-bg border-meeting-border text-meeting-text placeholder:text-meeting-muted"
                />
              </div>
              <Button
                type="submit"
                className="w-full gradient-hero border-0 text-primary-foreground font-semibold"
                disabled={loading}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Create Account
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-meeting-muted">
          Already have an account?{" "}
          <Link to="/login" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
