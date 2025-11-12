import { useMemo } from 'react';
import { Task } from '@/types';
import { format, differenceInDays, startOfDay, endOfDay, isAfter, isBefore } from 'date-fns';

interface GanttChartProps {
  tasks: Task[];
  startDate?: Date;
  endDate?: Date;
  onTaskUpdate?: (taskId: string, updates: { startDate?: Date; endDate?: Date }) => void;
}

export function GanttChart({ tasks, startDate, endDate, onTaskUpdate }: GanttChartProps) {
  // Calculate date range
  const dateRange = useMemo(() => {
    if (startDate && endDate) {
      return { start: startOfDay(startDate), end: endOfDay(endDate) };
    }

    // Calculate from tasks
    const taskDates = tasks
      .filter(t => t.dueDate)
      .map(t => new Date(t.dueDate));
    
    if (taskDates.length === 0) {
      const today = new Date();
      return { start: today, end: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000) };
    }

    const minDate = new Date(Math.min(...taskDates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...taskDates.map(d => d.getTime())));
    
    // Add padding
    const padding = 7 * 24 * 60 * 60 * 1000; // 7 days
    return {
      start: new Date(minDate.getTime() - padding),
      end: new Date(maxDate.getTime() + padding),
    };
  }, [tasks, startDate, endDate]);

  const totalDays = differenceInDays(dateRange.end, dateRange.start) + 1;
  const days = useMemo(() => {
    const daysArray = [];
    for (let i = 0; i < totalDays; i++) {
      const date = new Date(dateRange.start);
      date.setDate(date.getDate() + i);
      daysArray.push(date);
    }
    return daysArray;
  }, [dateRange.start, totalDays]);

  const getTaskPosition = (task: Task) => {
    if (!task.dueDate) return { left: 0, width: 0 };
    
    const taskDate = new Date(task.dueDate);
    const daysFromStart = differenceInDays(taskDate, dateRange.start);
    const leftPercent = (daysFromStart / totalDays) * 100;
    
    // Estimate task duration (default 1 day, or use estimated hours / 8)
    const duration = Math.max(1, Math.ceil((task.estimatedHours || 8) / 8));
    const widthPercent = (duration / totalDays) * 100;
    
    return {
      left: Math.max(0, Math.min(100, leftPercent)),
      width: Math.max(2, Math.min(100, widthPercent)),
    };
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'in_progress':
        return 'bg-blue-500';
      case 'review':
        return 'bg-yellow-500';
      case 'blocked':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'border-red-600';
      case 'high':
        return 'border-orange-500';
      case 'medium':
        return 'border-yellow-500';
      default:
        return 'border-gray-300';
    }
  };

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-full">
        {/* Header with dates */}
        <div className="flex border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="w-64 p-2 border-r border-gray-200 font-semibold">Task</div>
          <div className="flex-1 relative">
            <div className="flex">
              {days.map((day, index) => {
                const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
                return (
                  <div
                    key={index}
                    className={`flex-1 p-1 text-xs text-center border-r border-gray-200 ${
                      isWeekend ? 'bg-gray-50' : ''
                    } ${isToday ? 'bg-blue-100 font-bold' : ''}`}
                    style={{ minWidth: '60px' }}
                  >
                    <div>{format(day, 'MMM')}</div>
                    <div>{format(day, 'd')}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Task rows */}
        <div className="divide-y divide-gray-200">
          {tasks.map((task) => {
            const position = getTaskPosition(task);
            return (
              <div key={task.id} className="flex items-center min-h-[40px] hover:bg-gray-50">
                {/* Task name */}
                <div className="w-64 p-2 border-r border-gray-200 flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(task.status)}`} />
                  <span className="text-sm truncate" title={task.title}>
                    {task.title}
                  </span>
                </div>

                {/* Gantt bar */}
                <div className="flex-1 relative h-8">
                  {task.dueDate && position.width > 0 && (
                    <div
                      className={`absolute h-6 rounded ${getStatusColor(task.status)} ${getPriorityColor(task.priority)} border-2 opacity-80 hover:opacity-100 cursor-pointer transition-all`}
                      style={{
                        left: `${position.left}%`,
                        width: `${position.width}%`,
                        top: '4px',
                      }}
                      title={`${task.title} - ${format(new Date(task.dueDate), 'MMM d, yyyy')}`}
                    >
                      <div className="text-xs text-white px-1 truncate h-full flex items-center">
                        {task.title}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {tasks.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No tasks with due dates to display
          </div>
        )}
      </div>
    </div>
  );
}

