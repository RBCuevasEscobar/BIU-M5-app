const fs = require('fs');
const path = require('path');
const base = path.resolve('frontend/src');

function w(relPath, content) {
  const full = path.join(base, relPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content.trim() + '\n', 'utf8');
  console.log('Generated frontend:', relPath);
}

// 1. Theme CSS tokens & styles
w('theme/tokens.css', `
:root {
  /* IQ English Brand Colors (Manual de Identidad) */
  --iq-primary: #002e6d;        /* Pantone 294 C */
  --iq-primary-hover: #00204d;
  --iq-primary-light: #e6edf7;
  --iq-secondary: #5eb3e4;      /* Pantone 2915 C */
  --iq-secondary-hover: #489ecd;
  --iq-secondary-light: #eaf5fc;
  --iq-gray: #758592;           /* Pantone 7544 C */
  --iq-gray-light: #f1f4f7;
  --iq-gold: #c5a059;           /* Corporate Gold Accent */
  --iq-gold-light: #fdfaf3;
  --iq-dark: #121e28;

  /* Semantic UI Colors */
  --bg-app: #f8fafc;
  --bg-surface: #ffffff;
  --bg-surface-elevated: #ffffff;
  --border-color: #e2e8f0;
  --border-color-focus: #5eb3e4;
  --text-main: #0f172a;
  --text-muted: #64748b;
  --text-light: #94a3b8;

  /* Status Colors (Accessible with icons & text) */
  --status-success: #10b981;
  --status-success-bg: #ecfdf5;
  --status-warning: #f59e0b;
  --status-warning-bg: #fffbeb;
  --status-danger: #ef4444;
  --status-danger-bg: #fef2f2;
  --status-info: #3b82f6;
  --status-info-bg: #eff6ff;

  /* Typography */
  --font-family: 'Montserrat', system-ui, -apple-system, sans-serif;
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --radius-full: 9999px;
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: var(--font-family);
  background-color: var(--bg-app);
  color: var(--text-main);
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

button, input, select, textarea {
  font-family: inherit;
}

/* Texture pattern utility */
.iq-texture-bg {
  background-color: var(--iq-primary);
  background-image: 
    radial-gradient(circle at 10% 20%, rgba(94, 179, 228, 0.25) 0%, transparent 40%),
    radial-gradient(circle at 90% 80%, rgba(197, 160, 89, 0.2) 0%, transparent 40%),
    linear-gradient(135deg, rgba(0, 46, 109, 0.95) 0%, rgba(18, 30, 40, 0.98) 100%);
}
`);

// 2. Types
w('types/index.ts', `
export type RoleName = 'ROLE_STUDENT' | 'ROLE_TEACHER' | 'ROLE_SUPERVISOR' | 'ROLE_ADMIN';

export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone?: string;
  status: string;
  avatarUrl?: string;
  roles: string[];
  permissions: string[];
}

export interface StudentProfile {
  id: number;
  userId: number;
  studentNumber: string;
  fullName: string;
  email: string;
  campusId: number;
  campusName: string;
  currentLevelId: number;
  currentLevelName: string;
  currentBookId: number;
  currentBookNumber: number;
  currentBookTitle: string;
  currentModuleId: number;
  currentModuleCode: string;
  currentModuleTitle: string;
  enrollmentDate: string;
  status: string;
}

export interface TeacherProfile {
  id: number;
  userId: number;
  employeeNumber: string;
  fullName: string;
  email: string;
  campusId: number;
  campusName: string;
  specialty?: string;
  hireDate: string;
  status: string;
}

export interface Campus {
  id: number;
  code: string;
  name: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  phone?: string;
  email?: string;
  isActive: boolean;
}

export interface Book {
  id: number;
  levelId: number;
  levelName: string;
  bookNumber: number;
  title: string;
  description?: string;
  coverImage?: string;
  modules?: ModuleItem[];
}

export interface ModuleItem {
  id: number;
  bookId: number;
  bookNumber?: number;
  bookTitle?: string;
  moduleCode: string;
  title: string;
  description?: string;
  sequenceOrder: number;
  topics?: TopicItem[];
}

export interface TopicItem {
  id: number;
  moduleId: number;
  topicCode: string;
  title: string;
  grammarFocus?: string;
  vocabularyFocus?: string;
  speakingFocus?: string;
}

export interface TutoringGroup {
  id: number;
  code: string;
  name: string;
  campusId: number;
  campusName: string;
  teacherId: number;
  teacherName: string;
  bookId: number;
  bookNumber: number;
  bookTitle: string;
  moduleId: number;
  moduleCode: string;
  moduleTitle: string;
  topicId?: number;
  topicTitle?: string;
  capacity: number;
  currentEnrollment: number;
  availableSeats: number;
  full: boolean;
  status: string;
  modality: string;
  sessions?: GroupSession[];
  createdAt: string;
}

export interface GroupSession {
  id: number;
  groupId: number;
  groupCode: string;
  groupName: string;
  campusId: number;
  campusName: string;
  teacherId: number;
  teacherName: string;
  bookId: number;
  bookNumber: number;
  bookTitle: string;
  moduleId: number;
  moduleCode: string;
  moduleTitle: string;
  topicId?: number;
  topicTitle?: string;
  grammarFocus?: string;
  vocabularyFocus?: string;
  speakingFocus?: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  roomOrLink?: string;
  capacity: number;
  currentEnrollment: number;
  availableSeats: number;
  full: boolean;
  modality: string;
  status: string;
}

export interface Appointment {
  id: number;
  appointmentNumber: string;
  studentId: number;
  studentName: string;
  studentNumber: string;
  session: GroupSession;
  status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'RESCHEDULED' | 'NO_SHOW';
  bookedAt: string;
  cancelledAt?: string;
  cancellationReason?: string;
  previousAppointmentId?: number;
  attendanceStatus?: string;
  attendanceNotes?: string;
}

export interface Attendance {
  id: number;
  appointmentId: number;
  sessionId: number;
  studentId: number;
  studentName: string;
  studentNumber: string;
  status: 'PRESENT' | 'ABSENT' | 'EXCUSED';
  notes?: string;
  recordedByTeacherId: number;
  teacherName: string;
  recordedAt: string;
}

export interface NotificationItem {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  relatedEntityType?: string;
  relatedEntityId?: number;
  createdAt: string;
}

export interface DashboardSummary {
  role: string;
  userFullName: string;
  studentProfile?: StudentProfile;
  teacherProfile?: TeacherProfile;
  upcomingAppointments?: Appointment[];
  activeGroups?: TutoringGroup[];
  recentNotifications?: NotificationItem[];
  totalActiveGroups: number;
  totalAppointmentsToday: number;
  campusOccupancyRate: number;
  unreadNotificationsCount: number;
}

export interface AuditLog {
  id: number;
  userId?: number;
  username: string;
  action: string;
  entityName: string;
  entityId: string;
  details: string;
  ipAddress: string;
  traceId: string;
  createdAt: string;
}

export interface TalkIOSession {
  sessionId: string;
  studentName: string;
  moduleCode: string;
  topicTitle: string;
  avatarName: string;
  promptText: string;
  responseAudioUrl?: string;
  feedbackText: string;
  pronunciationScore: number;
  grammarScore: number;
  vocabularyScore: number;
}
`);

// 3. API Client Abstraction
w('services/api.ts', `
const API_BASE = '/api/v1';

export class ApiError extends Error {
  status: number;
  code: string;
  traceId?: string;

  constructor(message: string, status: number, code: string = 'ERROR', traceId?: string) {
    super(message);
    this.status = status;
    this.code = code;
    this.traceId = traceId;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('iq_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = \`Bearer \${token}\`;
  }

  const response = await fetch(\`\${API_BASE}\${endpoint}\`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorData = null;
    try {
      errorData = await response.json();
    } catch {
      // response is not json
    }

    const message = errorData?.message || \`Request failed with status \${response.status}\`;
    const code = errorData?.code || 'HTTP_' + response.status;
    const traceId = errorData?.traceId;

    throw new ApiError(message, response.status, code, traceId);
  }

  if (response.status === 204) {
    return {} as T;
  }

  const json = await response.json();
  return json.data !== undefined ? json.data : json;
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint, { method: 'GET' }),
  post: <T>(endpoint: string, body?: any) => request<T>(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(endpoint: string, body?: any) => request<T>(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  patch: <T>(endpoint: string, body?: any) => request<T>(endpoint, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),
};
`);

console.log('Frontend Part 1 (Theme, Types, API) generated');
