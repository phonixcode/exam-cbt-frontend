import {
  HeartPulse,
  Settings2,
  Scale,
  BarChart3,
  Monitor,
  Leaf,
  Palette,
  Globe,
  Pencil,
} from 'lucide-react'

export const COURSES = [
  {
    value:    'medicine',
    label:    'Medicine & Pharmacy',
    icon:     HeartPulse,
    subjects: ['use of english', 'biology', 'chemistry', 'physics'],
  },
  {
    value:    'engineering',
    label:    'Engineering',
    icon:     Settings2,
    subjects: ['use of english', 'mathematics', 'physics', 'chemistry'],
  },
  {
    value:    'law',
    label:    'Law & Mass Comm',
    icon:     Scale,
    subjects: ['use of english', 'literature', 'government', 'economics'],
  },
  {
    value:    'accounting',
    label:    'Accounting & Business',
    icon:     BarChart3,
    subjects: ['use of english', 'mathematics', 'economics', 'government'],
  },
  {
    value:    'computer_science',
    label:    'Computer Science',
    icon:     Monitor,
    subjects: ['use of english', 'mathematics', 'physics', 'biology'],
  },
  {
    value:    'agriculture',
    label:    'Agriculture',
    icon:     Leaf,
    subjects: ['use of english', 'biology', 'chemistry', 'mathematics'],
  },
  {
    value:    'arts',
    label:    'Arts & Education',
    icon:     Palette,
    subjects: ['use of english', 'literature', 'government', 'economics'],
  },
  {
    value:    'social_sciences',
    label:    'Social Sciences',
    icon:     Globe,
    subjects: ['use of english', 'economics', 'government', 'mathematics'],
  },
  {
    value:    'custom',
    label:    'Custom (pick my own)',
    icon:     Pencil,
    subjects: [],
  },
]