import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Edit2, Save, Eye, EyeOff, Loader2, RefreshCw, BookOpen, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { auth } from "@/lib/firebase";
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { supabase } from "@/integrations/supabase/client";
import ProductivityHeatmap from "@/components/ProductivityHeatmap";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  date_of_birth: string | null;
  age: number | null;
  school: string | null;
  class: string | null;
  gender: string | null;
  learning_style: string | null;
  quiz_completed: boolean;
  avatar_url: string | null;
}

interface EditingField {
  field: string | null;
  value: string;
}

const Settings = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const user = auth.currentUser;
  const isGoogleUser = user?.providerData.some((p) => p.providerId === "google.com");

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editing, setEditing] = useState<EditingField>({ field: null, value: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Password change state
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false,
  });

  useEffect(() => {
    fetchUserProfile();
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("firebase_uid", user.uid)
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile:", error);
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        });
        return;
      }
      
      if (data) {
        setProfile(data);
      } else {
        console.warn("No user profile found for:", user.uid);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (field: string, currentValue: string) => {
    setEditing({ field, value: currentValue || "" });
  };

  const handleSave = async (field: string) => {
    if (!profile || !user) return;

    try {
      setIsSaving(true);

      // Validation
      if (field === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editing.value)) {
        toast({
          title: "Invalid Email",
          description: "Please enter a valid email address",
          variant: "destructive",
        });
        return;
      }

      if (field === "name" && editing.value.trim().length < 2) {
        toast({
          title: "Invalid Name",
          description: "Name must be at least 2 characters",
          variant: "destructive",
        });
        return;
      }

      // Update in database
      const updateData: Record<string, any> = {};
      updateData[field] = editing.value;

      const { error } = await supabase
        .from("user_profiles")
        .update(updateData)
        .eq("id", profile.id);

      if (error) {
        // Handle 401 Unauthorized specifically
        if (error.code === 'PGRST301' || error.message.includes('401') || error.message.includes('Unauthorized')) {
          throw new Error('Authentication failed. Please log out and log back in.');
        }
        throw error;
      }

      // Update local state
      setProfile({ ...profile, [field]: editing.value } as UserProfile);
      setEditing({ field: null, value: "" });

      toast({
        title: "✅ Profile updated successfully!",
        description: `Your ${field} has been updated`,
      });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      
      let errorMessage = "Failed to update profile. Please try again.";
      
      if (error.message.includes('Authentication failed')) {
        errorMessage = "Authentication failed. Please log out and log back in.";
      } else if (error.message.includes('Unauthorized')) {
        errorMessage = "You don't have permission to update this profile.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Update Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!user || isGoogleUser) return;

    if (passwordData.newPassword.length < 8) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 8 characters",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "New password and confirmation must match",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSaving(true);

      // Re-authenticate user first
      const credential = EmailAuthProvider.credential(
        user.email!,
        passwordData.oldPassword
      );
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, passwordData.newPassword);

      toast({
        title: "🔐 Password updated successfully!",
        description: "Your password has been changed",
      });

      setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error: any) {
      console.error("Error updating password:", error);
      
      let errorMessage = "Failed to update password";
      if (error.code === "auth/wrong-password") {
        errorMessage = "Current password is incorrect";
      } else if (error.code === "auth/requires-recent-login") {
        errorMessage = "Please log out and log in again before changing your password";
      }

      toast({
        title: "⚠️ Update failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user || !profile) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid File",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploadingAvatar(true);

      // Upload to Supabase Storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.uid}_${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        // Check for bucket not found error
        const errorMsg = (uploadError.message || '').toLowerCase();
        const errorCode = String((uploadError as any).statusCode || (uploadError as any).code || '');
        
        if (errorMsg.includes('not found') || 
            errorMsg.includes('bucket') ||
            errorMsg.includes('does not exist') ||
            errorCode === '404' ||
            errorCode === '404 Not Found') {
          throw new Error('BUCKET_NOT_FOUND');
        }
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      // Update profile in database
      const { error: updateError } = await supabase
        .from("user_profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", profile.id);

      if (updateError) throw updateError;

      // Update local state
      setProfile({ ...profile, avatar_url: publicUrl });

      toast({
        title: "📸 Avatar updated successfully!",
        description: "Your profile picture has been updated",
      });
    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      
      // Show specific error message for bucket not found
      const errorMsg = (error?.message || '').toLowerCase();
      const errorCode = error?.code || error?.statusCode || '';
      
      if (errorMsg.includes('bucket not found') || 
          errorMsg.includes('not found') || 
          errorMsg.includes('bucket') ||
          errorMsg === 'bucket_not_found' ||
          errorCode === '404' ||
          error?.message === 'BUCKET_NOT_FOUND') {
        // Open dashboard in new tab automatically
        const dashboardUrl = "https://supabase.com/dashboard/project/tugqiaqepvaqnnrairax/storage/buckets";
        window.open(dashboardUrl, '_blank');
        
        toast({
          title: "❌ Storage Bucket Belum Dibuat",
          description: "Bucket 'avatars' belum dibuat di Supabase Storage. Dashboard Supabase telah dibuka di tab baru. Silakan buat bucket dengan: Nama 'avatars' (huruf kecil), centang 'Public bucket', lalu refresh halaman ini.",
          variant: "destructive",
          duration: 15000,
        });
      } else {
        toast({
          title: "Upload Failed",
          description: error?.message || "Failed to upload avatar. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsUploadingAvatar(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const renderEditableField = (
    label: string,
    field: keyof UserProfile,
    value: string | null,
    type: "text" | "date" | "select" = "text",
    options?: { value: string; label: string }[]
  ) => {
    const isEditing = editing.field === field;
    const displayValue = value || "Not set";

    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium">{label}</Label>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              {type === "select" && options ? (
                <Select value={editing.value} onValueChange={(val) => setEditing({ ...editing, value: val })}>
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {options.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  type={type}
                  value={editing.value}
                  onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                  className="flex-1"
                  autoFocus
                />
              )}
              <Button
                size="sm"
                onClick={() => handleSave(field)}
                disabled={isSaving}
                className="bg-gradient-to-r from-primary to-secondary hover:opacity-90"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setEditing({ field: null, value: "" })}
                disabled={isSaving}
              >
                Cancel
              </Button>
            </>
          ) : (
            <>
              <div className="flex-1 p-2 rounded-md bg-muted/50 text-sm">
                {type === "date" && value ? format(new Date(value), "PPP") : displayValue}
              </div>
              {field !== "email" || !isGoogleUser ? (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleEdit(field, value || "")}
                  className="hover:bg-primary/10"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              ) : null}
            </>
          )}
        </div>
        {field === "email" && isGoogleUser && (
          <p className="text-xs text-muted-foreground">Email cannot be changed for Google accounts</p>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Profile not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
        {/* Account Information */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-border shadow-lg">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl lg:text-2xl font-bold">Account Information</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Manage your personal details and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6 pt-0 sm:pt-0">
              {/* Profile Picture Upload Section */}
              <div className="flex flex-col items-center gap-3 sm:gap-4 pb-4 border-b">
                <div className="relative">
                  <Avatar className="w-18 h-18 sm:w-20 sm:h-20 lg:w-24 lg:h-24 border-4 border-border">
                    <AvatarImage src={profile.avatar_url || user?.photoURL || undefined} />
                    <AvatarFallback className="bg-gradient-to-r from-orange-400 to-blue-500 text-white text-lg sm:text-xl lg:text-2xl">
                      {profile.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAvatarUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingAvatar}
                    className="absolute bottom-0 right-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary hover:bg-primary/90 flex items-center justify-center text-white shadow-lg transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Upload new profile picture"
                  >
                    {isUploadingAvatar ? (
                      <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                    ) : (
                      <Camera className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    )}
                  </button>
                </div>
                <div className="text-center">
                  <p className="text-sm sm:text-base font-medium text-foreground">{profile.name}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1 truncate max-w-[200px] sm:max-w-none">{profile.email}</p>
                </div>
              </div>

              <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
                {renderEditableField("Full Name", "name", profile.name)}
                {renderEditableField("Email", "email", profile.email)}
                {renderEditableField("Date of Birth", "date_of_birth", profile.date_of_birth, "date")}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Age</Label>
                  <div className="p-2 rounded-md bg-muted/50 text-sm">
                    {profile.age || "Not calculated"} years
                  </div>
                  <p className="text-xs text-muted-foreground">Auto-calculated from date of birth</p>
                </div>
                {renderEditableField("School / Institution", "school", profile.school)}
                {renderEditableField("Class", "class", profile.class)}
                {renderEditableField("Gender", "gender", profile.gender, "select", [
                  { value: "male", label: "Male" },
                  { value: "female", label: "Female" },
                  { value: "other", label: "Other" },
                  { value: "prefer_not_to_say", label: "Prefer not to say" },
                ])}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Security Settings */}
        {!isGoogleUser && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-border shadow-lg">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl lg:text-2xl font-bold">Security Settings</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Change your password to keep your account secure</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0 sm:pt-0">
                <div className="space-y-2">
                  <Label>Current Password</Label>
                  <div className="relative">
                    <Input
                      type={showPasswords.old ? "text" : "password"}
                      value={passwordData.oldPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                      placeholder="Enter current password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPasswords({ ...showPasswords, old: !showPasswords.old })}
                    >
                      {showPasswords.old ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>New Password</Label>
                  <div className="relative">
                    <Input
                      type={showPasswords.new ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      placeholder="Enter new password (min. 8 characters)"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                    >
                      {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      type={showPasswords.confirm ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      placeholder="Confirm new password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                    >
                      {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <Button
                  onClick={handlePasswordChange}
                  disabled={isSaving || !passwordData.oldPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                  className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                >
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Update Password
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {isGoogleUser && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-border shadow-lg">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl lg:text-2xl font-bold">Security Settings</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Your account security is managed by Google</CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Your account uses Google Sign-In. Password cannot be changed here. Please manage your password through your Google account settings.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Learning Data Overview */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-border shadow-lg">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl lg:text-2xl font-bold">Learning Data Overview</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Your learning progress and style</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0 sm:pt-0">
              <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-1.5 sm:space-y-2">
                  <Label className="text-xs sm:text-sm font-medium">Learning Style</Label>
                  <div className="p-2.5 sm:p-3 rounded-md bg-gradient-to-r from-primary/10 to-secondary/10 text-xs sm:text-sm font-semibold capitalize">
                    {profile.learning_style || "Not determined"}
                  </div>
                </div>
                
                <div className="space-y-1.5 sm:space-y-2">
                  <Label className="text-xs sm:text-sm font-medium">Quiz Status</Label>
                  <div className="p-2.5 sm:p-3 rounded-md bg-muted/50 text-xs sm:text-sm">
                    {profile.quiz_completed ? "✅ Completed" : "⏳ Not completed"}
                  </div>
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <Label className="text-xs sm:text-sm font-medium">Account Created</Label>
                  <div className="p-2.5 sm:p-3 rounded-md bg-muted/50 text-xs sm:text-sm">
                    {user?.metadata.creationTime ? format(new Date(user.metadata.creationTime), "PP") : "Unknown"}
                  </div>
                </div>
              </div>

              <Button
                onClick={() => navigate("/quiz")}
                variant="outline"
                className="w-full gap-2 hover:bg-primary/10 text-xs sm:text-sm h-9 sm:h-10"
              >
                <RefreshCw className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                {profile.quiz_completed ? "Retake Learning Style Quiz" : "Take Learning Style Quiz"}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Productivity Tracker */}
        {profile.id && <ProductivityHeatmap userId={profile.id} />}
    </div>
  );
};

export default Settings;
