export interface Category {
  id: string;
  name: string;
  color: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Macro {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Micro {
  id: string;
  name: string;
  macroId: string;
  createdAt: string;
  updatedAt: string;
}

export type IES = 'UFPE' | 'UFRPE' | 'UPE' | 'IFPE' | 'UNICAP' | 'UNINASSAU' | 'OUTRAS';

export const IES_OPTIONS: { value: IES; label: string }[] = [
  { value: 'UFPE', label: 'UFPE' },
  { value: 'UFRPE', label: 'UFRPE' },
  { value: 'UPE', label: 'UPE' },
  { value: 'IFPE', label: 'IFPE' },
  { value: 'UNICAP', label: 'UNICAP' },
  { value: 'UNINASSAU', label: 'UNINASSAU' },
  { value: 'OUTRAS', label: 'Outras' },
];

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  endDate?: string;
  startTime?: string | null;
  endTime?: string | null;
  categoryId: string;
  ies?: IES; // deprecated
  location?: string; // deprecated
  macroId?: string | null;
  microId?: string | null;
  macroName?: string | null;
  microName?: string | null;
  link?: string;
  allDay: boolean;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CalendarFilter {
  categories: string[];
  searchQuery: string;
  location?: string;
}

export function getCategoryStyles(color: string) {
  return {
    bgClass: `bg-[hsl(${color}/0.15)]`,
    textClass: `text-[hsl(${color})]`,
    dotClass: `bg-[hsl(${color})]`,
  };
}
