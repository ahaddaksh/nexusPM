import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/components/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { 
  Users, 
  Building2, 
  UsersRound, 
  Shield, 
  Tag as TagIcon,
  Plus,
  Edit,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { User, Department, Team, AllowedDomain, Tag } from '@/types';
import { adminService } from '@/lib/admin-service';
import { RefreshCw, Settings } from 'lucide-react';

export default function Admin() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('users');

  // Check if user is admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      toast({
        title: 'Access Denied',
        description: 'You need admin privileges to access this page.',
        variant: 'destructive',
      });
    }
  }, [user, toast]);

  if (!user || user.role !== 'admin') {
    return (
      <AppLayout>
        <div className="p-6 lg:p-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
                <p className="text-muted-foreground">You need admin privileges to access this page.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-gray-600">Manage users, teams, departments, and system settings</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="users">
              <Users className="h-4 w-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="teams">
              <UsersRound className="h-4 w-4 mr-2" />
              Teams
            </TabsTrigger>
            <TabsTrigger value="departments">
              <Building2 className="h-4 w-4 mr-2" />
              Departments
            </TabsTrigger>
            <TabsTrigger value="domains">
              <Shield className="h-4 w-4 mr-2" />
              Allowed Domains
            </TabsTrigger>
            <TabsTrigger value="tags">
              <TagIcon className="h-4 w-4 mr-2" />
              Tags
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <UsersManagement />
          </TabsContent>

          <TabsContent value="teams" className="space-y-4">
            <TeamsManagement />
          </TabsContent>

          <TabsContent value="departments" className="space-y-4">
            <DepartmentsManagement />
          </TabsContent>

          <TabsContent value="domains" className="space-y-4">
            <AllowedDomainsManagement />
          </TabsContent>

          <TabsContent value="tags" className="space-y-4">
            <TagsManagement />
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <SettingsManagement />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

// Users Management Component
function UsersManagement() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: 'member' as User['role'],
    isActive: true,
    teamId: '',
    departmentId: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Use Promise.allSettled to prevent one failure from blocking others
      const [usersResult, teamsResult, departmentsResult] = await Promise.allSettled([
        adminService.getUsers(),
        adminService.getTeams(),
        adminService.getDepartments(),
      ]);

      if (usersResult.status === 'fulfilled') {
        setUsers(usersResult.value);
      } else {
        console.error('Error loading users:', usersResult.reason);
        setUsers([]);
        toast({
          title: 'Warning',
          description: 'Could not load users. You may need to sync from authentication first.',
          variant: 'default',
        });
      }

      if (teamsResult.status === 'fulfilled') {
        setTeams(teamsResult.value);
      } else {
        console.error('Error loading teams:', teamsResult.reason);
        setTeams([]);
      }

      if (departmentsResult.status === 'fulfilled') {
        setDepartments(departmentsResult.value);
      } else {
        console.error('Error loading departments:', departmentsResult.reason);
        setDepartments([]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncUsers = async () => {
    try {
      await adminService.syncUsersFromAuth();
      await loadData();
      toast({
        title: 'Success',
        description: 'Users synced from authentication',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to sync users',
        variant: 'destructive',
      });
    }
  };

  const handleSave = async () => {
    if (!formData.firstName || !formData.lastName || !formData.email) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (editingUser) {
        await adminService.updateUser(editingUser.id, {
          ...formData,
          teamId: formData.teamId || null,
          departmentId: formData.departmentId || null,
        });
      } else {
        // For new users, we need to create them in auth first
        // This is a simplified version - in production, you'd want proper user creation
        toast({
          title: 'Info',
          description: 'User creation requires authentication setup. Please use the registration page or sync existing users.',
          variant: 'default',
        });
        return;
      }
      toast({
        title: 'Success',
        description: editingUser ? 'User updated' : 'User created',
      });
      setIsDialogOpen(false);
      setEditingUser(null);
      loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save user',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Users</CardTitle>
            <CardDescription>Manage system users and their permissions</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleSyncUsers}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Sync from Auth
            </Button>
            <Button onClick={() => { setEditingUser(null); setFormData({ email: '', firstName: '', lastName: '', role: 'member', isActive: true, teamId: '', departmentId: '' }); setIsDialogOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Team</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  <div className="space-y-2">
                    <p>No users found in the users table.</p>
                    <p className="text-sm">Click "Sync from Auth" to sync users from authentication.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.firstName} {user.lastName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'admin' ? 'default' : 'outline'}>
                      {user.role || 'member'}
                    </Badge>
                  </TableCell>
                  <TableCell>{(user as any).teamId ? teams.find(t => t.id === (user as any).teamId)?.name || '-' : '-'}</TableCell>
                  <TableCell>{(user as any).departmentId ? departments.find(d => d.id === (user as any).departmentId)?.name || '-' : '-'}</TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? 'default' : 'secondary'}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingUser(user);
                          setFormData({
                            email: user.email,
                            firstName: user.firstName,
                            lastName: user.lastName,
                            role: user.role || 'member',
                            isActive: user.isActive ?? true,
                            teamId: (user as any).teamId || '',
                            departmentId: (user as any).departmentId || '',
                          });
                          setIsDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingUser ? 'Edit User' : 'Add User'}</DialogTitle>
              <DialogDescription>
                {editingUser ? 'Update user information' : 'Create a new user account'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value: User['role']) => setFormData({ ...formData, role: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="team">Team</Label>
                  <Select
                    value={formData.teamId}
                    onValueChange={(value) => setFormData({ ...formData, teamId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select team" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No Team</SelectItem>
                      {teams.map((team) => (
                        <SelectItem key={team.id} value={team.id}>
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select
                  value={formData.departmentId}
                  onValueChange={(value) => setFormData({ ...formData, departmentId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No Department</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

// Teams Management Component (placeholder)
function TeamsManagement() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Teams</CardTitle>
        <CardDescription>Manage teams and team assignments</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Teams management coming soon...</p>
      </CardContent>
    </Card>
  );
}

// Departments Management Component (placeholder)
function DepartmentsManagement() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Departments</CardTitle>
        <CardDescription>Manage departments and organizational structure</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Departments management coming soon...</p>
      </CardContent>
    </Card>
  );
}

// Allowed Domains Management Component (placeholder)
function AllowedDomainsManagement() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Allowed Domains</CardTitle>
        <CardDescription>Configure which email domains are allowed for self signup</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Allowed domains management coming soon...</p>
      </CardContent>
    </Card>
  );
}

// Tags Management Component (placeholder)
function TagsManagement() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tags</CardTitle>
        <CardDescription>Manage tags for categorizing tasks and projects</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Tags management coming soon...</p>
      </CardContent>
    </Card>
  );
}

// Settings Management Component
function SettingsManagement() {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    aiApiKey: '',
    aiApiUrl: '',
    aiModel: 'deepseek-reasoner',
    supabaseUrl: '',
    supabaseAnonKey: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getSettings();
      setSettings({
        aiApiKey: data.aiApiKey || '',
        aiApiUrl: data.aiApiUrl || '',
        aiModel: data.aiModel || 'deepseek-reasoner',
        supabaseUrl: data.supabaseUrl || '',
        supabaseAnonKey: data.supabaseAnonKey || '',
      });
    } catch (error) {
      console.error('Error loading settings:', error);
      // Settings might not exist yet, that's okay
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await adminService.updateSettings(settings);
      toast({
        title: 'Success',
        description: 'Settings saved successfully. Note: You may need to update environment variables in Vercel for these to take effect in production.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save settings',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-12">Loading settings...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Settings</CardTitle>
        <CardDescription>Manage API keys, models, and system configuration</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-4">AI Configuration</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="aiApiKey">AI API Key</Label>
                <Input
                  id="aiApiKey"
                  type="password"
                  value={settings.aiApiKey}
                  onChange={(e) => setSettings({ ...settings, aiApiKey: e.target.value })}
                  placeholder="Enter your AI API key"
                />
                <p className="text-xs text-muted-foreground">
                  Your DeepSeek or other AI provider API key
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="aiApiUrl">AI API URL</Label>
                <Input
                  id="aiApiUrl"
                  value={settings.aiApiUrl}
                  onChange={(e) => setSettings({ ...settings, aiApiUrl: e.target.value })}
                  placeholder="https://api.deepseek.com/v1/chat/completions"
                />
                <p className="text-xs text-muted-foreground">
                  The API endpoint URL for your AI provider
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="aiModel">AI Model</Label>
                <Select
                  value={settings.aiModel}
                  onValueChange={(value) => setSettings({ ...settings, aiModel: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="deepseek-reasoner">DeepSeek Reasoner</SelectItem>
                    <SelectItem value="deepseek-chat">DeepSeek Chat</SelectItem>
                    <SelectItem value="gpt-4">GPT-4</SelectItem>
                    <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  The AI model to use for processing
                </p>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-4">Supabase Configuration</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="supabaseUrl">Supabase URL</Label>
                <Input
                  id="supabaseUrl"
                  value={settings.supabaseUrl}
                  onChange={(e) => setSettings({ ...settings, supabaseUrl: e.target.value })}
                  placeholder="https://your-project.supabase.co"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supabaseAnonKey">Supabase Anon Key</Label>
                <Input
                  id="supabaseAnonKey"
                  type="password"
                  value={settings.supabaseAnonKey}
                  onChange={(e) => setSettings({ ...settings, supabaseAnonKey: e.target.value })}
                  placeholder="Enter your Supabase anon key"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

