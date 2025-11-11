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
          <TabsList className="grid w-full grid-cols-5">
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
      // TODO: Implement API calls
      // const usersData = await adminService.getUsers();
      // const teamsData = await adminService.getTeams();
      // const departmentsData = await adminService.getDepartments();
      // setUsers(usersData);
      // setTeams(teamsData);
      // setDepartments(departmentsData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load users',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      // TODO: Implement save
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
        description: 'Failed to save user',
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
          <Button onClick={() => { setEditingUser(null); setIsDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
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
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No users found. Create your first user to get started.
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
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
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
                            teamId: '',
                            departmentId: '',
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

