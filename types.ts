export interface ExperienceItem {
  id: string;
  title: string;
  company: string;
  companyUrl?: string;
  location: string;
  startDate: string;
  endDate: string | 'Present';
  description: string;
  technologies: string[];
  logoUrl?: string;
  color?: string; // Hex color for accent
}
