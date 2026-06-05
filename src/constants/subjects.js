import {
  BookOpen,
  Calculator,
  Atom,
  FlaskConical,
  Dna,
  TrendingUp,
  Landmark,
  BookMarked,
  Shuffle,
  Calendar,
  BookCopy,
  Target,
} from 'lucide-react'

export const SUBJECTS = [
  { value: 'use of english',      label: 'Use of English',    icon: BookOpen      },
  { value: 'mathematics',         label: 'Mathematics',       icon: Calculator    },
  { value: 'physics',             label: 'Physics',           icon: Atom          },
  { value: 'chemistry',           label: 'Chemistry',         icon: FlaskConical  },
  { value: 'biology',             label: 'Biology',           icon: Dna           },
  { value: 'economics',           label: 'Economics',         icon: TrendingUp    },
  { value: 'government',          label: 'Government',        icon: Landmark      },
  { value: 'literature',          label: 'Literature',        icon: BookMarked    },
]

export const YEARS = Array.from(
  { length: new Date().getFullYear() - 2000 + 1 },
  (_, i) => new Date().getFullYear() - i
)

export const EXAM_MODES = [
  {
    value:       'single',
    label:       'Single Subject',
    description: 'Practice one subject at a time',
    icon:        BookCopy,
  },
  {
    value:       'mock',
    label:       'Full Mock Exam',
    description: '4 subjects · 180 questions · JAMB format',
    icon:        Target,
  },
]

export const SELECTION_TYPES = [
  {
    value:       'random',
    label:       'Random Mix',
    description: 'Questions from a year range',
    icon:        Shuffle,
  },
  {
    value:       'specific',
    label:       'Specific Year',
    description: 'All questions from one year',
    icon:        Calendar,
  },
]

export const JAMB_MOCK_TIME    = 7200  // 2 hours — full mock (180 questions)
export const JAMB_TIME_ALLOWED = 7200  // default fallback