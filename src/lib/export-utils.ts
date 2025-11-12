/**
 * Export utilities for generating Excel, CSV, and PDF reports
 * Implements BRD requirements for exporting and sharing reports
 */

import { format } from 'date-fns';

/**
 * Export data to CSV format
 */
export function exportToCSV(data: any[], filename: string, headers?: string[]) {
  if (!data || data.length === 0) {
    throw new Error('No data to export');
  }

  // Use provided headers or extract from first object
  const csvHeaders = headers || Object.keys(data[0]);
  
  // Create CSV content
  const csvContent = [
    csvHeaders.join(','), // Header row
    ...data.map(row => 
      csvHeaders.map(header => {
        const value = row[header];
        // Handle values that might contain commas or quotes
        if (value === null || value === undefined) return '';
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(',')
    )
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}-${format(new Date(), 'yyyy-MM-dd')}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export data to Excel format (XLSX) using a simple approach
 * Note: For full Excel support, consider using a library like xlsx
 */
export function exportToExcel(data: any[], filename: string, headers?: string[], sheetName: string = 'Sheet1') {
  // For now, we'll create a CSV that Excel can open
  // In production, consider using a library like 'xlsx' for proper Excel format
  exportToCSV(data, filename, headers);
  
  // TODO: Implement proper XLSX format using xlsx library
  // import * as XLSX from 'xlsx';
  // const ws = XLSX.utils.json_to_sheet(data);
  // const wb = XLSX.utils.book_new();
  // XLSX.utils.book_append_sheet(wb, ws, sheetName);
  // XLSX.writeFile(wb, `${filename}-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
}

/**
 * Export HTML content to PDF using browser print functionality
 */
export function exportToPDF(content: string, title: string, filename: string) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    throw new Error('Failed to open print window. Please allow popups.');
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <style>
          @media print {
            @page {
              margin: 1cm;
              size: A4;
            }
            body {
              margin: 0;
              padding: 20px;
            }
          }
          body {
            font-family: Arial, sans-serif;
            padding: 40px;
            line-height: 1.6;
            color: #333;
          }
          h1 {
            color: #1f2937;
            border-bottom: 2px solid #3b82f6;
            padding-bottom: 10px;
            margin-bottom: 20px;
          }
          h2 {
            color: #374151;
            margin-top: 30px;
            margin-bottom: 15px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
          }
          th {
            background-color: #f3f4f6;
            font-weight: 600;
          }
          .header-info {
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 1px solid #e5e7eb;
          }
          .header-info p {
            margin: 5px 0;
            color: #6b7280;
          }
          pre {
            white-space: pre-wrap;
            font-family: Arial, sans-serif;
            background-color: #f9fafb;
            padding: 15px;
            border-radius: 4px;
          }
        </style>
      </head>
      <body>
        <div class="header-info">
          <h1>${title}</h1>
          <p><strong>Generated:</strong> ${format(new Date(), 'MMMM dd, yyyy HH:mm')}</p>
        </div>
        ${content}
      </body>
    </html>
  `);
  
  printWindow.document.close();
  
  // Wait for content to load, then trigger print
  setTimeout(() => {
    printWindow.print();
  }, 250);
}

/**
 * Export project status data to various formats
 */
export function exportProjectStatusReport(
  projects: any[],
  format: 'csv' | 'excel' | 'pdf',
  filename: string = 'project-status-report'
) {
  const data = projects.map(project => ({
    'Project Name': project.name,
    'Status': project.status,
    'Completion %': `${project.completionPercentage.toFixed(1)}%`,
    'Completed Tasks': project.completedTasks,
    'Total Tasks': project.totalTasks,
    'Hours Logged': `${(project.totalHours / 60).toFixed(1)}h`,
    'Estimated Hours': `${(project.estimatedHours / 60).toFixed(1)}h`,
    'Days Remaining': project.daysRemaining > 0 ? `${project.daysRemaining} days` : 'Overdue',
    'Timeline Progress': `${project.timelineProgress.toFixed(1)}%`,
  }));

  const headers = [
    'Project Name',
    'Status',
    'Completion %',
    'Completed Tasks',
    'Total Tasks',
    'Hours Logged',
    'Estimated Hours',
    'Days Remaining',
    'Timeline Progress',
  ];

  if (format === 'csv' || format === 'excel') {
    exportToCSV(data, filename, headers);
  } else if (format === 'pdf') {
    const htmlContent = `
      <table>
        <thead>
          <tr>
            ${headers.map(h => `<th>${h}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${data.map(row => `
            <tr>
              ${headers.map(h => `<td>${row[h]}</td>`).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    exportToPDF(htmlContent, 'Project Status Report', filename);
  }
}

/**
 * Export task statistics to various formats
 */
export function exportTaskStatisticsReport(
  stats: any,
  format: 'csv' | 'excel' | 'pdf',
  filename: string = 'task-statistics-report'
) {
  const data = [
    {
      'Metric': 'Total Tasks',
      'Value': stats.totalTasks,
    },
    {
      'Metric': 'Overdue Tasks',
      'Value': stats.overdueTasks,
    },
    {
      'Metric': 'Average Estimated Hours',
      'Value': `${stats.avgEstimatedHours.toFixed(1)}h`,
    },
    {
      'Metric': 'Average Time to Complete',
      'Value': `${stats.avgTimeToComplete.toFixed(1)} days`,
    },
    {
      'Metric': 'Completion Rate',
      'Value': `${stats.completionRate.toFixed(1)}%`,
    },
  ];

  const headers = ['Metric', 'Value'];

  if (format === 'csv' || format === 'excel') {
    exportToCSV(data, filename, headers);
  } else if (format === 'pdf') {
    const htmlContent = `
      <h2>Task Statistics Summary</h2>
      <table>
        <thead>
          <tr>
            ${headers.map(h => `<th>${h}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${data.map(row => `
            <tr>
              ${headers.map(h => `<td>${row[h]}</td>`).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    exportToPDF(htmlContent, 'Task Statistics Report', filename);
  }
}

/**
 * Export productivity data to various formats
 */
export function exportProductivityReport(
  productivityData: any,
  format: 'csv' | 'excel' | 'pdf',
  filename: string = 'productivity-report'
) {
  // Export project productivity
  if (productivityData.project && productivityData.project.length > 0) {
    const data = productivityData.project.map((item: any) => ({
      'Project': item.name,
      'Hours Logged': `${(item.hoursLogged / 60).toFixed(1)}h`,
      'Estimated Hours': `${(item.estimatedHours / 60).toFixed(1)}h`,
      'Productivity %': `${item.productivityPercentage.toFixed(1)}%`,
      'Tasks Completed': item.tasksCompleted,
    }));

    const headers = ['Project', 'Hours Logged', 'Estimated Hours', 'Productivity %', 'Tasks Completed'];

    if (format === 'csv' || format === 'excel') {
      exportToCSV(data, filename, headers);
    } else if (format === 'pdf') {
      const htmlContent = `
        <h2>Project Productivity Report</h2>
        <table>
          <thead>
            <tr>
              ${headers.map(h => `<th>${h}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${data.map((row: any) => `
              <tr>
                ${headers.map(h => `<td>${row[h]}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
      exportToPDF(htmlContent, 'Productivity Report', filename);
    }
  }
}

/**
 * Export resource allocation data
 */
export function exportResourceAllocationReport(
  allocationData: any[],
  format: 'csv' | 'excel' | 'pdf',
  filename: string = 'resource-allocation-report'
) {
  const headers = ['Resource', 'Project', 'Hours Allocated', 'Hours Logged', 'Utilization %', 'Workload Status'];

  if (format === 'csv' || format === 'excel') {
    exportToCSV(allocationData, filename, headers);
  } else if (format === 'pdf') {
    const htmlContent = `
      <h2>Resource Allocation Report</h2>
      <table>
        <thead>
          <tr>
            ${headers.map(h => `<th>${h}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${allocationData.map((row: any) => `
            <tr>
              ${headers.map(h => `<td>${row[h] || ''}</td>`).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    exportToPDF(htmlContent, 'Resource Allocation Report', filename);
  }
}

