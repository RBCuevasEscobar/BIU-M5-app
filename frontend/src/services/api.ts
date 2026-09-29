import {
  Appointment,
  TutoringGroup,
  CreateTutoringGroupPayload,
  UpdateTutoringGroupPayload,
  DuplicateTutoringGroupPayload,
  GroupReport,
  User,
  PageResponse,
  CreateUserPayload,
  UpdateUserPayload,
  ChangePasswordPayload,
  AdminPasswordResetPayload,
  UserRoleUpdatePayload,
  UserReport,
  AuditLog
} from '../types';

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
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
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

    const message = errorData?.message || `Request failed with status ${response.status}`;
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
  post: <T>(endpoint: string, body?: unknown) => request<T>(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(endpoint: string, body?: unknown) => request<T>(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  patch: <T>(endpoint: string, body?: unknown) => request<T>(endpoint, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),

  // User Management Service API

  // Tutoring Group Management Service API
  groups: {
    getAll: (filters?: { campusId?: number; moduleId?: number; teacherId?: number; bookId?: number; status?: string }) => {
      const q = new URLSearchParams();
      if (filters?.campusId) q.append('campusId', filters.campusId.toString());
      if (filters?.moduleId) q.append('moduleId', filters.moduleId.toString());
      if (filters?.teacherId) q.append('teacherId', filters.teacherId.toString());
      if (filters?.bookId) q.append('bookId', filters.bookId.toString());
      if (filters?.status) q.append('status', filters.status);
      return request<TutoringGroup[]>(`/tutoring/groups?${q.toString()}`, { method: 'GET' });
    },
    getById: (id: number) => request<TutoringGroup>(`/tutoring/groups/${id}`, { method: 'GET' }),
    create: (data: CreateTutoringGroupPayload) => request<TutoringGroup>('/tutoring/groups', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: UpdateTutoringGroupPayload) => request<TutoringGroup>(`/tutoring/groups/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) => request<void>(`/tutoring/groups/${id}`, { method: 'DELETE' }),
    duplicate: (id: number, data: DuplicateTutoringGroupPayload) => request<TutoringGroup>(`/tutoring/groups/${id}/duplicate`, { method: 'POST', body: JSON.stringify(data) }),
    updateStatus: (id: number, status: string) => request<TutoringGroup>(`/tutoring/groups/${id}/status?status=${status}`, { method: 'PATCH' }),
    getReport: (filters?: { campusId?: number; moduleId?: number; teacherId?: number; bookId?: number; status?: string }) => {
      const q = new URLSearchParams();
      if (filters?.campusId) q.append('campusId', filters.campusId.toString());
      if (filters?.moduleId) q.append('moduleId', filters.moduleId.toString());
      if (filters?.teacherId) q.append('teacherId', filters.teacherId.toString());
      if (filters?.bookId) q.append('bookId', filters.bookId.toString());
      if (filters?.status) q.append('status', filters.status);
      return request<GroupReport>(`/tutoring/groups/report?${q.toString()}`, { method: 'GET' });
    },
    getEnrolledStudents: (groupId: number) => {
      return request<Appointment[]>(`/tutoring/groups/${groupId}/students`, { method: 'GET' });
    },
    downloadEnrolledStudentsCsv: async (groupId?: number, filters?: { campusId?: number; moduleId?: number; teacherId?: number }) => {
      const q = new URLSearchParams();
      if (groupId) q.append('groupId', groupId.toString());
      if (filters?.campusId) q.append('campusId', filters.campusId.toString());
      if (filters?.moduleId) q.append('moduleId', filters.moduleId.toString());
      if (filters?.teacherId) q.append('teacherId', filters.teacherId.toString());

      const token = localStorage.getItem('iq_token');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/tutoring/groups/students/export/csv?${q.toString()}`, {
        method: 'GET',
        headers,
      });

      if (!res.ok) throw new Error('Error al descargar el reporte CSV de alumnos inscritos');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `alumnos_inscritos_${groupId ? 'grupo_' + groupId : 'todos'}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    },
    downloadCsv: async (filters?: { campusId?: number; moduleId?: number; teacherId?: number; bookId?: number; status?: string }) => {
      const q = new URLSearchParams();
      if (filters?.campusId) q.append('campusId', filters.campusId.toString());
      if (filters?.moduleId) q.append('moduleId', filters.moduleId.toString());
      if (filters?.teacherId) q.append('teacherId', filters.teacherId.toString());
      if (filters?.bookId) q.append('bookId', filters.bookId.toString());
      if (filters?.status) q.append('status', filters.status);

      const token = localStorage.getItem('iq_token');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/tutoring/groups/export/csv?${q.toString()}`, {
        method: 'GET',
        headers,
      });

      if (!res.ok) throw new Error('Error al descargar el reporte CSV de grupos');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'tutoring_groups_report.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    }
  }
,
  users: {
    getPaged: (params: { page?: number; size?: number; sort?: string; search?: string; role?: string; status?: string }) => {
      const q = new URLSearchParams();
      if (params.page !== undefined) q.append('page', params.page.toString());
      if (params.size !== undefined) q.append('size', params.size.toString());
      if (params.sort) q.append('sort', params.sort);
      if (params.search) q.append('search', params.search);
      if (params.role) q.append('role', params.role);
      if (params.status) q.append('status', params.status);
      return request<PageResponse<User>>(`/users?${q.toString()}`, { method: 'GET' });
    },
    getAll: () => request<User[]>('/users/all', { method: 'GET' }),
    getById: (id: number) => request<User>(`/users/${id}`, { method: 'GET' }),
    create: (data: CreateUserPayload) => request<User>('/users', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: UpdateUserPayload) => request<User>(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    updateStatus: (id: number, status: string) => request<User>(`/users/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    updateRoles: (id: number, data: UserRoleUpdatePayload) => request<User>(`/users/${id}/role`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: number) => request<void>(`/users/${id}`, { method: 'DELETE' }),
    changeOwnPassword: (data: ChangePasswordPayload) => request<void>('/users/change-password', { method: 'POST', body: JSON.stringify(data) }),
    adminResetPassword: (id: number, data: AdminPasswordResetPayload) => request<void>(`/users/${id}/password-reset`, { method: 'POST', body: JSON.stringify(data) }),
    getReport: () => request<UserReport>('/users/report', { method: 'GET' }),
    getAuditLogs: (id: number) => request<AuditLog[]>(`/users/${id}/audit`, { method: 'GET' }),
    downloadCsv: async (search?: string, role?: string, status?: string) => {
      const q = new URLSearchParams();
      if (search) q.append('search', search);
      if (role) q.append('role', role);
      if (status) q.append('status', status);

      const token = localStorage.getItem('iq_token');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/users/export/csv?${q.toString()}`, {
        method: 'GET',
        headers,
      });

      if (!res.ok) throw new Error('Error al descargar el archivo CSV');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'iq_users_export.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    }
  }
};
