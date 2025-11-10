import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useTasks } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { Task } from '@/types';
import { ArrowLeft, Plus } from 'lucide-react';

export default function Tasks() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { tasks, fetchTasks, createTask, updateTaskStatus, isLoading, error: tasksError } = useTasks();
  const { projects, fetchProjects, isLoading: projectsLoading } = useProjects();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as Task['priority'],
    projectId: '',
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchTasks();
        await fetchProjects();
      } catch (error) {
        console.error('Error loading data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load tasks. Please check your database connection.',
          variant: 'destructive',
        });
      }
    };
    loadData();
  }, [fetchTasks, fetchProjects, toast]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title.trim() || !user) return;

    try {
      await createTask({
        title: newTask.title,
        description: newTask.description,
        projectId: newTask.projectId || undefined, // Empty string becomes undefined
        priority: newTask.priority,
        estimatedHours: 1,
        assignedTo: user.id,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      });
      
      setNewTask({
        title: '',
        description: '',
        priority: 'medium',
        projectId: '',
      });
      setIsDialogOpen(false);
      await fetchTasks();
      
      toast({
        title: 'Success',
        description: 'Task created successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create task',
        variant: 'destructive',
      });
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: Task['status']) => {
    try {
      await updateTaskStatus(taskId, newStatus);
      toast({
        title: 'Success',
        description: 'Task status updated',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update task status',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadgeVariant = (status: Task['status']) => {
    switch (status) {
      case 'todo':
        return 'secondary';
      case 'in_progress':
        return 'default';
      case 'completed':
        return 'default';
      case 'review':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'destructive';
      case 'high':
        return 'default';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
              <p className="text-gray-600">Manage all your tasks</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Task
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Task</DialogTitle>
                  <CardDescription>Create a task with or without a project</CardDescription>
                </DialogHeader>
                <form onSubmit={handleCreateTask} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Task Title</Label>
                    <Input
                      id="title"
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                      placeholder="Enter task title"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newTask.description}
                      onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                      placeholder="Enter task description (optional)"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="project">Project (Optional)</Label>
                    <Select value={newTask.projectId} onValueChange={(value) => setNewTask({ ...newTask, projectId: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a project (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No Project</SelectItem>
                        {projects.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={newTask.priority} onValueChange={(value: Task['priority']) => setNewTask({ ...newTask, priority: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? 'Creating...' : 'Create Task'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {tasksError && (
          <Card className="mb-6 border-destructive">
            <CardContent className="pt-6">
              <div className="text-destructive">
                <p className="font-semibold">Error loading tasks:</p>
                <p className="text-sm">{tasksError}</p>
                <p className="text-sm mt-2">
                  Make sure you've run the database migration in Supabase. See SETUP_GUIDE.md for instructions.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading tasks...</p>
          </div>
        )}

        {!isLoading && !tasksError && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasks.map((task) => {
            const project = projects.find(p => p.id === task.projectId);
            return (
              <Card key={task.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{task.title}</CardTitle>
                    <Badge variant={getPriorityColor(task.priority)}>{task.priority}</Badge>
                  </div>
                  <CardDescription>
                    {project ? project.name : 'No Project'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {task.description && (
                    <p className="text-sm text-muted-foreground">{task.description}</p>
                  )}
                  <Badge variant={getStatusBadgeVariant(task.status)}>
                    {task.status.replace('_', ' ')}
                  </Badge>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusChange(task.id, 'todo')}
                      disabled={task.status === 'todo'}
                    >
                      To Do
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusChange(task.id, 'in_progress')}
                      disabled={task.status === 'in_progress'}
                    >
                      In Progress
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusChange(task.id, 'completed')}
                      disabled={task.status === 'completed'}
                    >
                      Completed
                    </Button>
                  </div>
                  {task.projectId && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/projects/${task.projectId}`)}
                      className="w-full"
                    >
                      View Project
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
          </div>
        )}

        {!isLoading && !tasksError && tasks.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No tasks yet. Create your first task!</p>
          </div>
        )}
      </div>
    </div>
  );
}

