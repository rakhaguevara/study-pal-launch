import { useState } from "react";
import { motion } from "framer-motion";
import { Upload, Save, Clock, Calendar, Book } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/lib/firebase";

const Settings = () => {
  const { toast } = useToast();
  const user = auth.currentUser;

  const [formData, setFormData] = useState({
    displayName: user?.displayName || "",
    email: user?.email || "",
    password: "",
  });

  const studyHistory = [
    { subject: "Mathematics", date: "2025-04-10", duration: "2h 30m" },
    { subject: "Physics", date: "2025-04-09", duration: "1h 45m" },
    { subject: "Chemistry", date: "2025-04-08", duration: "3h 15m" },
    { subject: "Biology", date: "2025-04-07", duration: "2h 00m" },
    { subject: "English", date: "2025-04-06", duration: "1h 30m" },
  ];

  const handleSaveChanges = () => {
    toast({
      title: "Changes Saved",
      description: "Your profile has been updated successfully.",
    });
  };

  const handlePhotoUpload = () => {
    toast({
      title: "Upload Photo",
      description: "Photo upload functionality will be implemented soon.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-orange-50/20 to-blue-50/20">
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
                  <AvatarImage src={user?.photoURL || undefined} />
                  <AvatarFallback className="bg-gradient-to-r from-orange-400 to-blue-500 text-white text-2xl">
                    {formData.displayName?.substring(0, 2).toUpperCase() || "SP"}
                  </AvatarFallback>
                </Avatar>
                <Button
                  onClick={handlePhotoUpload}
                  variant="outline"
                  className="gap-2 hover:bg-gradient-to-r hover:from-orange-400 hover:via-blue-500 hover:to-indigo-600 hover:text-white transition-all duration-300"
                >
                  <Upload className="h-4 w-4" />
                  Change Profile Photo
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
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter your email"
                    className="focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="password">Change Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Enter new password"
                    className="focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>
              </div>

              {/* Save Button */}
              <Button
                onClick={handleSaveChanges}
                className="w-full bg-gradient-to-r from-orange-400 via-blue-500 to-indigo-600 hover:shadow-lg hover:shadow-orange-500/50 transition-all duration-300 gap-2"
              >
                <Save className="h-4 w-4" />
                Save Changes
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
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;
