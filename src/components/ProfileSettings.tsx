import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Globe, 
  Shield, 
  Bell, 
  Camera,
  Save,
  Edit,
  X,
  Check,
  AlertCircle
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  bio?: string;
  location?: string;
  website?: string;
  avatar?: string;
  timezone: string;
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    automation: boolean;
    billing: boolean;
  };
  privacy: {
    profileVisible: boolean;
    dataSharing: boolean;
    analytics: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

interface ProfileSettingsProps {
  onClose: () => void;
}

export const ProfileSettings = ({ onClose }: ProfileSettingsProps) => {
  const [profile, setProfile] = useState<UserProfile>({
    id: 'demo-user-123',
    name: 'Demo User',
    email: 'demo@example.com',
    phone: '+1 (555) 123-4567',
    bio: 'Instagram automation enthusiast and content creator',
    location: 'San Francisco, CA',
    website: 'https://example.com',
    avatar: '',
    timezone: 'America/Los_Angeles',
    language: 'en',
    notifications: {
      email: true,
      push: true,
      automation: true,
      billing: true
    },
    privacy: {
      profileVisible: true,
      dataSharing: false,
      analytics: true
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<UserProfile>(profile);
  const [activeTab, setActiveTab] = useState('profile');

  const timezones = [
    'America/Los_Angeles',
    'America/Denver',
    'America/Chicago',
    'America/New_York',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Australia/Sydney'
  ];

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'it', name: 'Italiano' },
    { code: 'pt', name: 'Português' },
    { code: 'ru', name: 'Русский' },
    { code: 'ja', name: '日本語' },
    { code: 'ko', name: '한국어' },
    { code: 'zh', name: '中文' }
  ];

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await fetch('/api/user/profile');
      const data = await res.json();
      setProfile(data);
      setEditedProfile(data);
    } catch {}
  };

  const saveProfile = async () => {
    const res = await fetch('/api/user/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editedProfile),
    });
    if (!res.ok) {
      toast({ title: 'Failed to update', variant: 'destructive' });
      return;
    }
    const { profile: updatedProfile } = await res.json();
    setProfile(updatedProfile);
    setIsEditing(false);
    toast({ title: 'Profile updated', description: 'Your profile has been saved successfully' });
  };

  const handleInputChange = (field: string, value: any) => {
    setEditedProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedChange = (section: string, field: string, value: any) => {
    setEditedProfile(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof UserProfile],
        [field]: value
      }
    }));
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        handleInputChange('avatar', e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Profile Settings</h2>
          <p className="text-muted-foreground">Manage your account information and preferences</p>
        </div>
        <Button variant="ghost" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        <Button
          variant={activeTab === 'profile' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('profile')}
          className="flex-1"
        >
          <User className="w-4 h-4 mr-2" />
          Profile
        </Button>
        <Button
          variant={activeTab === 'notifications' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('notifications')}
          className="flex-1"
        >
          <Bell className="w-4 h-4 mr-2" />
          Notifications
        </Button>
        <Button
          variant={activeTab === 'privacy' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('privacy')}
          className="flex-1"
        >
          <Shield className="w-4 h-4 mr-2" />
          Privacy
        </Button>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          {/* Avatar Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Profile Picture</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="w-20 h-20">
                    {editedProfile.avatar ? (
                      <img src={editedProfile.avatar} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <AvatarFallback className="bg-gradient-instagram text-white text-xl">
                        {getInitials(editedProfile.name)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  {isEditing && (
                    <Button
                      size="sm"
                      className="absolute -bottom-1 -right-1 rounded-full w-6 h-6"
                      onClick={() => document.getElementById('avatar-upload')?.click()}
                    >
                      <Camera className="w-3 h-3" />
                    </Button>
                  )}
                </div>
                <div>
                  <p className="font-medium">{profile.name}</p>
                  <p className="text-sm text-muted-foreground">Member since {new Date(profile.createdAt).toLocaleDateString()}</p>
                  {isEditing && (
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={editedProfile.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={editedProfile.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={editedProfile.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={editedProfile.location || ''}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={editedProfile.bio || ''}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  disabled={!isEditing}
                  placeholder="Tell us about yourself..."
                  className="min-h-20"
                />
              </div>
              
              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={editedProfile.website || ''}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  disabled={!isEditing}
                  placeholder="https://example.com"
                />
              </div>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={editedProfile.timezone}
                    onValueChange={(value) => handleInputChange('timezone', value)}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timezones.map(tz => (
                        <SelectItem key={tz} value={tz}>
                          {tz.replace('_', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="language">Language</Label>
                  <Select
                    value={editedProfile.language}
                    onValueChange={(value) => handleInputChange('language', value)}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map(lang => (
                        <SelectItem key={lang.code} value={lang.code}>
                          {lang.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Notification Preferences</CardTitle>
              <p className="text-sm text-muted-foreground">
                Choose how you want to be notified about your automations and account activity
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                  </div>
                  <Switch
                    checked={editedProfile.notifications.email}
                    onCheckedChange={(checked) => handleNestedChange('notifications', 'email', checked)}
                    disabled={!isEditing}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Push Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive push notifications in your browser</p>
                  </div>
                  <Switch
                    checked={editedProfile.notifications.push}
                    onCheckedChange={(checked) => handleNestedChange('notifications', 'push', checked)}
                    disabled={!isEditing}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Automation Updates</p>
                    <p className="text-sm text-muted-foreground">Get notified when automations run or encounter issues</p>
                  </div>
                  <Switch
                    checked={editedProfile.notifications.automation}
                    onCheckedChange={(checked) => handleNestedChange('notifications', 'automation', checked)}
                    disabled={!isEditing}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Billing Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive notifications about billing and subscription updates</p>
                  </div>
                  <Switch
                    checked={editedProfile.notifications.billing}
                    onCheckedChange={(checked) => handleNestedChange('notifications', 'billing', checked)}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Privacy Tab */}
      {activeTab === 'privacy' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Privacy Settings</CardTitle>
              <p className="text-sm text-muted-foreground">
                Control your privacy and data sharing preferences
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Profile Visibility</p>
                    <p className="text-sm text-muted-foreground">Make your profile visible to other users</p>
                  </div>
                  <Switch
                    checked={editedProfile.privacy.profileVisible}
                    onCheckedChange={(checked) => handleNestedChange('privacy', 'profileVisible', checked)}
                    disabled={!isEditing}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Data Sharing</p>
                    <p className="text-sm text-muted-foreground">Allow sharing of anonymized usage data for product improvement</p>
                  </div>
                  <Switch
                    checked={editedProfile.privacy.dataSharing}
                    onCheckedChange={(checked) => handleNestedChange('privacy', 'dataSharing', checked)}
                    disabled={!isEditing}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Analytics</p>
                    <p className="text-sm text-muted-foreground">Enable analytics to track automation performance</p>
                  </div>
                  <Switch
                    checked={editedProfile.privacy.analytics}
                    onCheckedChange={(checked) => handleNestedChange('privacy', 'analytics', checked)}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-orange-900">Data Export & Deletion</h4>
                  <p className="text-sm text-orange-700 mt-1">
                    You can request a copy of your data or delete your account at any time.
                  </p>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-100">
                      Export Data
                    </Button>
                    <Button size="sm" variant="outline" className="border-red-300 text-red-700 hover:bg-red-100">
                      Delete Account
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-6 border-t">
        {isEditing ? (
          <>
            <Button variant="outline" onClick={() => { setEditedProfile(profile); setIsEditing(false); }} className="flex-1">
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={saveProfile} className="flex-1">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </>
        ) : (
          <Button onClick={() => setIsEditing(true)} className="flex-1">
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        )}
      </div>
    </div>
  );
};
