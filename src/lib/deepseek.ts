import { AISuggestion } from '../types';

// Mock implementation for Deepseek API integration
// In a real implementation, this would make actual API calls to Deepseek

export const deepseekService = {
  async processMeetingNotes(notes: string, projectId?: string): Promise<AISuggestion[]> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock response - matching the canonical AISuggestion type
    const mockSuggestions: AISuggestion[] = [
      {
        id: '1',
        meetingId: 'mock-meeting-1',
        originalText: notes.substring(0, 100),
        suggestedTask: 'Create project plan document based on meeting discussion',
        confidenceScore: 0.85,
        status: 'pending',
        reviewedBy: null,
        reviewedAt: null,
        rejectionReason: null,
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        meetingId: 'mock-meeting-1',
        originalText: notes.substring(100, 200),
        suggestedTask: 'Schedule follow-up meeting to review progress',
        confidenceScore: 0.78,
        status: 'pending',
        reviewedBy: null,
        reviewedAt: null,
        rejectionReason: null,
        createdAt: new Date().toISOString(),
      },
      {
        id: '3',
        meetingId: 'mock-meeting-1',
        originalText: notes.substring(200, 300),
        suggestedTask: 'Send meeting summary email to all participants',
        confidenceScore: 0.92,
        status: 'pending',
        reviewedBy: null,
        reviewedAt: null,
        rejectionReason: null,
        createdAt: new Date().toISOString(),
      }
    ];

    return mockSuggestions;
  },

  async refineTaskDescription(description: string): Promise<string> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Mock refinement - in a real implementation, this would use AI to improve the description
    return description + ' This task requires careful attention to detail and should be completed with high priority.';
  }
};