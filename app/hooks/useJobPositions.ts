import { useQuery } from '@tanstack/react-query';

interface JobPosition {
  id: string;
  name: string;
  ar_name: string;
}

async function fetchJobPositions(): Promise<JobPosition[]> {
  const response = await fetch('/api/job-positions');
  if (!response.ok) {
    throw new Error('Failed to fetch job positions');
  }
  return response.json();
}

export function useJobPositions() {
  return useQuery({
    queryKey: ['jobPositions'],
    queryFn: fetchJobPositions,
  });
}
