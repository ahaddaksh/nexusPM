import { useState, useCallback } from 'react';
import { Meeting, AISuggestion } from '../types';
import { meetingsService } from '../lib/supabase-data';

export const useMeetings = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMeetings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await meetingsService.getMeetings();
      setMeetings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch meetings');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getMeeting = useCallback(async (id: string): Promise<Meeting | null> => {
    setIsLoading(true);
    setError(null);
    try {
      return await meetingsService.getMeeting(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch meeting');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getMeetingSuggestions = useCallback(async (meetingId: string): Promise<AISuggestion[]> => {
    setIsLoading(true);
    setError(null);
    try {
      return await meetingsService.getMeetingSuggestions(meetingId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch suggestions');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    meetings,
    isLoading,
    error,
    fetchMeetings,
    getMeeting,
    getMeetingSuggestions,
  };
};

