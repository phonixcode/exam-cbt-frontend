import { BookCopy, Layers, Clock, PencilLine } from 'lucide-react'

// Two ways to practice. "single" = one topic, "mock" = several topics together.
export const EXAM_MODES = [
  {
    value:       'single',
    label:       'Single Topic',
    description: 'Practice one topic at a time',
    icon:        BookCopy,
  },
  {
    value:       'mock',
    label:       'Mock Exam',
    description: 'Mix several topics together',
    icon:        Layers,
  },
]

// How many questions to pull from each topic (null = every available question)
export const QUESTION_COUNTS = [
  { value: 10,   label: '10'  },
  { value: 20,   label: '20'  },
  { value: 40,   label: '40'  },
  { value: null, label: 'All' },
]

// Timed vs relaxed practice
export const TIMING_MODES = [
  { value: 'timed',    label: 'Timed',    description: 'Beat the clock',         icon: Clock      },
  { value: 'practice', label: 'Practice', description: 'No timer, learn freely', icon: PencilLine },
]

export const DEFAULT_PASS_MARK = 50
