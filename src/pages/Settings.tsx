import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Upload, Save, Clock, Calendar, Book, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { auth, db, storage } from "@/lib/firebase";
import { updateProfile, updatePassword } from "firebase/auth";
import { doc, setDoc, getDoc, collection, getDocs, query, orderBy } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

interface StudySession {
  subject: string;
  date: string;
  duration: string;
}

const Settings = () => {
  const { toast } = useToast();
  const user = auth.currentUser;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
    password: "",
  });

  const [photoURL, setPhotoURL] = useState<string>("");
  const [studyHistory, setStudyHistory] = useState<StudySession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  // Check if user is logged in with Google
  const isGoogleUser = user?.providerData.some(
    (provider) => provider.providerId === "google.com"
  );

  useEffect(() => {
    if (user) {
      setFormData({
        displayName: user.displayName || "",
        email: user.email || "",
        password: "",
      });
      setPhotoURL(user.photoURL || "");
      loadStudyHistory();
    }
  }, [user]);

  const loadStudyHistory = async () => {
    if (!user) return;

    try {
      setIsLoadingHistory(true);
      const sessionsRef = collection(db, "users", user.uid, "studyHistory");
      const q = query(sessionsRef, orderBy("timestamp", "desc"));
      const querySnapshot = await getDocs(q);

      const sessions: StudySession[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        sessions.push({
          subject: data.subject || "Unknown",
          date: data.date || new Date(data.timestamp?.toDate()).toLocaleDateString(),
          duration: data.duration || "0m",
        });
      });

      setStudyHistory(sessions);
    } catch (error) {
      console.error("Error loading study history:", error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handlePhotoUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid File",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

      // Upload to Firebase Storage
      const storageRef = ref(storage, `profileImages/${user.uid}.jpg`);
      await uploadBytes(storageRef, file);

      // Get download URL
      const downloadURL = await getDownloadURL(storageRef);

      // Update Firebase Auth profile
      await updateProfile(user, {
        photoURL: downloadURL,
      });

      // Update Firestore
      await setDoc(
        doc(db, "users", user.uid),
        { photoURL: downloadURL },
        { merge: true }
      );

      setPhotoURL(downloadURL);

      toast({
        title: "Photo Updated",
        description: "Your profile photo has been updated successfully.",
      });
    } catch (error) {
      console.error("Error uploading photo:", error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload photo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      // Update displayName if changed
      if (formData.displayName !== user.displayName) {
        await updateProfile(user, {
          displayName: formData.displayName,
        });

        await setDoc(
          doc(db, "users", user.uid),
          { displayName: formData.displayName },
          { merge: true }
        );
      }

      // Update password if provided and not a Google user
      if (formData.password && !isGoogleUser) {
        await updatePassword(user, formData.password);
        setFormData({ ...formData, password: "" });
        toast({
          title: "Password Updated",
          description: "Your password has been changed successfully.",
        });
      }

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error: any) {
      console.error("Error saving changes:", error);
      
      let errorMessage = "Failed to save changes. Please try again.";
      if (error.code === "auth/requires-recent-login") {
        errorMessage = "Please log out and log in again before changing your password.";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Password should be at least 6 characters.";
      }

      toast({
        title: "Update Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-orange-50/20 to-blue-50/20">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Navbar */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-white/90"
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-400 via-blue-500 to-indigo-600 bg-clip-text text-transparent">
            StudyPal Settings
          </h1>
        </div>
      </motion.nav>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* Profile Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-border shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-foreground">User Profile</CardTitle>
              <CardDescription>Manage your account information and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Photo Section */}
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24 border-4 border-gradient-to-r from-orange-400 to-blue-500">
                  <AvatarImage src={photoURL} />
                  <AvatarFallback className="bg-gradient-to-r from-orange-400 to-blue-500 text-white text-2xl">
                    {formData.displayName?.substring(0, 2).toUpperCase() || 
                     formData.email?.substring(0, 2).toUpperCase() || "SP"}
                  </AvatarFallback>
                </Avatar>
                <Button
                  onClick={handlePhotoUpload}
                  variant="outline"
                  disabled={isLoading}
                  className="gap-2 hover:bg-gradient-to-r hover:from-orange-400 hover:via-blue-500 hover:to-indigo-600 hover:text-white transition-all duration-300"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Change Profile Photo
                    </>
                  )}
                </Button>
              </div>

              {/* Form Fields */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Username</Label>
                  <Input
                    id="displayName"
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    placeholder="Enter your username"
                    className="focus:ring-2 focus:ring-orange-400/50"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    placeholder="Your email"
                    className="focus:ring-2 focus:ring-blue-500/50"
                    disabled={true}
                  />
                  {isGoogleUser && (
                    <p className="text-xs text-muted-foreground">
                      Email cannot be changed for Google accounts
                    </p>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="password">Change Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder={isGoogleUser ? "Not available for Google accounts" : "Enter new password"}
                    className="focus:ring-2 focus:ring-indigo-500/50"
                    disabled={isGoogleUser || isLoading}
                  />
                  {isGoogleUser && (
                    <p className="text-xs text-muted-foreground">
                      Password cannot be changed for Google accounts
                    </p>
                  )}
                </div>
              </div>

              {/* Save Button */}
              <Button
                onClick={handleSaveChanges}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-orange-400 via-blue-500 to-indigo-600 hover:shadow-lg hover:shadow-orange-500/50 transition-all duration-300 gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Study History Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-border shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-foreground">Study History</CardTitle>
              <CardDescription>Your recent learning activities</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingHistory ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                </div>
              ) : studyHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Book className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Belum ada riwayat belajar</p>
                  <p className="text-sm mt-1">Mulai belajar untuk melihat riwayat Anda di sini</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {studyHistory.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-orange-400/50 hover:bg-gradient-to-r hover:from-orange-50/30 hover:to-blue-50/30 transition-all duration-300 group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-full bg-gradient-to-r from-orange-400/10 to-blue-500/10 group-hover:from-orange-400/20 group-hover:to-blue-500/20 transition-colors">
                          <Book className="h-5 w-5 text-orange-500" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground">{item.subject}</h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {item.date}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {item.duration}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;
