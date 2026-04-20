import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import logo from "@/assets/afromeet-logo.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Loader2, Camera } from "lucide-react";

const TIME_ZONES = Intl.supportedValuesOf
  ? Intl.supportedValuesOf("timeZone")
  : ["UTC", "America/New_York", "America/Los_Angeles", "Europe/London", "Africa/Nairobi", "Asia/Tokyo"];

const getInitials = (name: string) =>
  name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("") || "?";

interface ProfileFormProps {
  isSetup?: boolean;
}

const ProfileForm = ({ isSetup = false }: ProfileFormProps) => {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState(profile?.display_name ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [timeZone, setTimeZone] = useState(
    profile?.time_zone ?? Intl.DateTimeFormat().resolvedOptions().timeZone
  );
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;
    const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (upErr) {
      toast.error("Failed to upload avatar: " + upErr.message);
      setUploading(false);
      return;
    }
    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
    setAvatarUrl(urlData.publicUrl);
    setUploading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      display_name: displayName.trim() || null,
      bio: bio.trim() || null,
      time_zone: timeZone || null,
      avatar_url: avatarUrl || null,
      updated_at: new Date().toISOString(),
    });
    setSaving(false);
    if (error) {
      toast.error("Failed to save profile: " + error.message);
      return;
    }
    await refreshProfile();
    toast.success("Profile saved!");
    if (isSetup) {
      navigate("/lobby");
    }
  };

  return (
    <div className="min-h-screen bg-meeting-bg flex flex-col">
      <header className="flex items-center gap-3 px-4 py-3 border-b border-meeting-border">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Afromeet" className="h-7" />
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <Card className="bg-meeting-surface border-meeting-border">
            <CardHeader className="space-y-1">
              <CardTitle className="text-xl font-display text-meeting-text">
                {isSetup ? "Set up your profile" : "Edit profile"}
              </CardTitle>
              <CardDescription className="text-meeting-muted">
                {isSetup
                  ? "Complete your profile to get started"
                  : "Update your Afromeet profile"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-5">
                {/* Avatar */}
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={avatarUrl} />
                      <AvatarFallback className="gradient-hero text-primary-foreground font-bold text-lg">
                        {getInitials(displayName || user?.email || "")}
                      </AvatarFallback>
                    </Avatar>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center border-2 border-meeting-surface"
                      disabled={uploading}
                    >
                      {uploading ? (
                        <Loader2 className="w-3 h-3 text-white animate-spin" />
                      ) : (
                        <Camera className="w-3 h-3 text-white" />
                      )}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-meeting-text">Profile photo</p>
                    <p className="text-xs text-meeting-muted">JPG, PNG or GIF up to 5 MB</p>
                  </div>
                </div>

                {/* Display name */}
                <div className="space-y-1.5">
                  <Label htmlFor="displayName" className="text-meeting-text text-sm">Display name</Label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your name"
                    className="bg-meeting-bg border-meeting-border text-meeting-text placeholder:text-meeting-muted"
                  />
                </div>

                {/* Bio */}
                <div className="space-y-1.5">
                  <Label htmlFor="bio" className="text-meeting-text text-sm">Bio <span className="text-meeting-muted">(optional)</span></Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell others a bit about yourself..."
                    rows={3}
                    className="bg-meeting-bg border-meeting-border text-meeting-text placeholder:text-meeting-muted resize-none"
                  />
                </div>

                {/* Timezone */}
                <div className="space-y-1.5">
                  <Label className="text-meeting-text text-sm">Time zone</Label>
                  <Select value={timeZone} onValueChange={setTimeZone}>
                    <SelectTrigger className="bg-meeting-bg border-meeting-border text-meeting-text">
                      <SelectValue placeholder="Select time zone" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {TIME_ZONES.map((tz) => (
                        <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-3 pt-2">
                  {!isSetup && (
                    <Button
                      type="button"
                      variant="secondary"
                      className="flex-1"
                      onClick={() => navigate(-1)}
                    >
                      Cancel
                    </Button>
                  )}
                  <Button
                    type="submit"
                    className="flex-1 gradient-hero border-0 text-primary-foreground font-semibold"
                    disabled={saving}
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    {isSetup ? "Continue to Meeting" : "Save Changes"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

const Profile = () => <ProfileForm isSetup={false} />;
export const ProfileSetup = () => <ProfileForm isSetup={true} />;

export default Profile;
