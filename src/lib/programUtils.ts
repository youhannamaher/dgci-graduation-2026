import { ProgramItem } from './types';

export interface CalculatedProgramItem extends ProgramItem {
  calculatedStartTime: string;
  calculatedEndTime: string;
  formattedRange: string;
  durationMinutes: number;
}

/**
 * Parses a time string like "6:30 PM", "07:00 PM", "18:30", or "7 PM" into total minutes from midnight.
 */
export function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 18 * 60 + 30; // Default 6:30 PM (1110 minutes)

  const clean = timeStr.trim().toUpperCase();
  const isPM = clean.includes('PM');
  const isAM = clean.includes('AM');

  // Extract digits and colon
  const timeOnly = clean.replace(/AM|PM/g, '').trim();
  const parts = timeOnly.split(':');

  let hours = parseInt(parts[0], 10) || 0;
  const minutes = parts.length > 1 ? parseInt(parts[1], 10) || 0 : 0;

  if (isPM && hours < 12) hours += 12;
  if (isAM && hours === 12) hours = 0;

  return hours * 60 + minutes;
}

/**
 * Formats total minutes from midnight back to 12-hour "6:30 PM" string format.
 */
export function formatMinutesToTime(totalMins: number): string {
  let normalized = Math.floor(totalMins) % (24 * 60);
  if (normalized < 0) normalized += 24 * 60;

  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;

  const period = hours >= 12 ? 'PM' : 'AM';
  let displayHours = hours % 12;
  if (displayHours === 0) displayHours = 12;

  const displayMinutes = String(minutes).padStart(2, '0');
  return `${displayHours}:${displayMinutes} ${period}`;
}

/**
 * Dynamically calculates cumulative program timeline items based on a base start time.
 */
export function calculateProgramSchedule(
  items: ProgramItem[],
  baseStartTime: string
): {
  calculatedItems: CalculatedProgramItem[];
  totalDurationMinutes: number;
  ceremonyEndTime: string;
  formattedTotalDuration: string;
} {
  if (!items || items.length === 0) {
    return {
      calculatedItems: [],
      totalDurationMinutes: 0,
      ceremonyEndTime: baseStartTime || '6:30 PM',
      formattedTotalDuration: '0 mins'
    };
  }

  const sorted = [...items].sort((a, b) => a.order - b.order);

  // If a program item is currently active (isCurrent), we can use the base start time or calculate from item 1
  const startMins = parseTimeToMinutes(baseStartTime || sorted[0].time || '6:30 PM');
  let currentMins = startMins;
  let totalDurationMinutes = 0;

  const calculatedItems: CalculatedProgramItem[] = sorted.map((item) => {
    const duration = typeof item.durationMinutes === 'number' && item.durationMinutes > 0 ? item.durationMinutes : 5;
    totalDurationMinutes += duration;

    const startStr = formatMinutesToTime(currentMins);
    const endMins = currentMins + duration;
    const endStr = formatMinutesToTime(endMins);

    currentMins = endMins;

    return {
      ...item,
      durationMinutes: duration,
      calculatedStartTime: startStr,
      calculatedEndTime: endStr,
      formattedRange: `${startStr} – ${endStr}`
    };
  });

  const ceremonyEndTime = formatMinutesToTime(startMins + totalDurationMinutes);

  const hours = Math.floor(totalDurationMinutes / 60);
  const mins = totalDurationMinutes % 60;
  let formattedTotalDuration = '';
  if (hours > 0 && mins > 0) {
    formattedTotalDuration = `${hours} Hours ${mins} Mins`;
  } else if (hours > 0) {
    formattedTotalDuration = `${hours} Hour${hours > 1 ? 's' : ''}`;
  } else {
    formattedTotalDuration = `${mins} Mins`;
  }

  return {
    calculatedItems,
    totalDurationMinutes,
    ceremonyEndTime,
    formattedTotalDuration
  };
}
