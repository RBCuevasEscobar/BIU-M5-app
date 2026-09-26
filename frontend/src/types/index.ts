export type RoleName = 'ROLE_STUDENT' | 'ROLE_TEACHER' | 'ROLE_SUPERVISOR' | 'ROLE_ADMIN';

export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | string;
  avatarUrl?: string;
  roles: string[];
  permissions: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface CreateUserPayload {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: string;
  roles?: string[];
  status?: string;
  campusId?: number;
  studentNumber?: string;
  employeeNumber?: string;
  specialty?: string;
}

export interface UpdateUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  status?: string;
  avatarUrl?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface AdminPasswordResetPayload {
  newPassword: string;
}

export interface UserRoleUpdatePayload {
  role?: string;
  roles?: string[];
}

export interface UserReport {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  suspendedUsers: number;
  roleDistribution: Record<string, number>;
  statusDistribution: Record<string, number>;
  recentRegistrations30Days: number;
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
  teacherSessions?: GroupSession[];
  recentNotifications?: NotificationItem[];
  totalActiveGroups?: number;
  totalAppointmentsToday?: number;
  campusOccupancyRate?: number;
  unreadNotificationsCount?: number;
  currentModuleAttendanceCount?: number;
  currentModuleTotalRequired?: number;
  currentModuleGrade?: number;
  studentCurriculumProgress?: StudentModuleItem[];
  suggestedTutoring?: SuggestedTutoring;
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

export interface CreateTutoringGroupPayload {
  name: string;
  campusId: number;
  teacherId: number;
  moduleId: number;
  topicId?: number;
  capacity: number;
  modality?: string;
  initialSessionDate?: string;
  initialStartTime?: string;
  initialEndTime?: string;
  durationMinutes?: number;
  roomOrLink?: string;
}

export interface UpdateTutoringGroupPayload {
  name: string;
  campusId: number;
  teacherId: number;
  moduleId: number;
  topicId?: number;
  capacity: number;
  modality?: string;
  status?: string;
}

export interface DuplicateGroupPayload {
  newName?: string;
  newTeacherId?: number;
  newCode?: string;
  newSessionDate?: string;
  newStartTime?: string;
  newEndTime?: string;
}

export interface GroupReportItem {
  groupId: number;
  code: string;
  name: string;
  campusName: string;
  teacherName: string;
  teacherEmail: string;
  bookTitle: string;
  bookNumber: number;
  moduleCode: string;
  moduleTitle: string;
  topicTitle: string;
  capacity: number;
  currentEnrollment: number;
  availableSeats: number;
  occupancyPercentage: number;
  status: string;
  modality: string;
  sessionsCount: number;
  createdAt: string;
}

export interface GroupReport {
  generatedAt: string;
  generatedBy: string;
  scope: string;
  totalGroups: number;
  totalCapacity: number;
  totalEnrolled: number;
  totalAvailableSeats: number;
  averageOccupancyPercentage: number;
  publishedCount: number;
  inactiveCount: number;
  cancelledCount: number;
  items: GroupReportItem[];
}

export interface StudentModuleItem {
  moduleId: number;
  moduleCode: string;
  moduleTitle: string;
  bookId: number;
  bookNumber: number;
  bookTitle: string;
  sequenceOrder: number;
  status: 'COMPLETED' | 'CONFIRMED' | 'PENDING' | 'GROUP_PENDING';
  completionDate?: string;
  grade?: number;
  attendanceCount?: number;
  hasAvailableGroups: boolean;
  appointmentId?: number;
  appointmentDate?: string;
  appointmentTime?: string;
  teacherName?: string;
  campusName?: string;
}

export interface SuggestedTutoring {
  moduleId: number;
  moduleCode: string;
  moduleTitle: string;
  bookTitle: string;
  bookNumber: number;
  hasGroup: boolean;
  status: 'PENDING' | 'GROUP_PENDING';
  groupId?: number;
  groupCode?: string;
  groupName?: string;
  sessionId?: number;
  sessionDate?: string;
  startTime?: string;
  endTime?: string;
  teacherName?: string;
  campusName?: string;
  availableSeats?: number;
  capacity?: number;
}