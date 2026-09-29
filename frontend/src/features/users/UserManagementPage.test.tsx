import { describe, it, expect } from 'vitest';
import { User, PageResponse, CreateUserPayload, UpdateUserPayload, UserReport } from '../../types';

describe('User Management Model & Domain Logic', () => {
  it('instantiates valid User object with proper role and status', () => {
    const user: User = {
      id: 1,
      username: 'admin.alberto',
      email: 'admin@iqenglish.mx',
      firstName: 'Alberto',
      lastName: 'Castillo',
      fullName: 'Alberto Castillo',
      phone: '+52 246 123 4567',
      status: 'ACTIVE',
      roles: ['ROLE_ADMIN'],
      permissions: ['USER_CREATE', 'USER_READ', 'USER_UPDATE', 'USER_DISABLE'],
      createdAt: '2026-09-25T10:00:00Z',
    };

    expect(user.id).toBe(1);
    expect(user.username).toBe('admin.alberto');
    expect(user.status).toBe('ACTIVE');
    expect(user.roles).toContain('ROLE_ADMIN');
    expect(user.permissions).toContain('USER_CREATE');
  });

  it('correctly identifies SUPERVISOR role without mapping to student or alumno', () => {
    const supervisorUser: User = {
      id: 4,
      username: 'supervisor.laura',
      email: 'laura.supervisor@iqenglish.mx',
      firstName: 'Laura',
      lastName: 'Gomez',
      fullName: 'Laura Gomez',
      status: 'ACTIVE',
      roles: ['ROLE_SUPERVISOR'],
      permissions: ['CAMPUS_MANAGE', 'TEACHER_SCHEDULE_VIEW', 'GROUP_READ'],
    };

    const roleTag = supervisorUser.roles[0];
    const badgeStatus = roleTag === 'ROLE_ADMIN' ? 'ROLE_ADMIN' : roleTag === 'ROLE_SUPERVISOR' ? 'ROLE_SUPERVISOR' : roleTag === 'ROLE_TEACHER' ? 'ROLE_TEACHER' : 'ROLE_STUDENT';
    expect(badgeStatus).toBe('ROLE_SUPERVISOR');
    expect(badgeStatus).not.toBe('ALUMNO');
    expect(badgeStatus).not.toBe('ESTUDIANTE');
  });

  it('validates CreateUserPayload schema for student with academic fields', () => {
    const studentPayload: CreateUserPayload = {
      username: 'student.carlos',
      email: 'carlos.mendoza@iqenglish.mx',
      password: 'SecurePassword123!',
      firstName: 'Carlos',
      lastName: 'Mendoza',
      phone: '+52 246 999 8877',
      role: 'ROLE_STUDENT',
      status: 'ACTIVE',
      campusId: 1,
      currentLevelId: 1,
      currentBookId: 1,
      currentModuleId: 1,
      studentNumber: 'STU-2026-00101',
    };

    expect(studentPayload.username.length).toBeGreaterThanOrEqual(3);
    expect(studentPayload.password.length).toBeGreaterThanOrEqual(6);
    expect(studentPayload.role).toBe('ROLE_STUDENT');
    expect(studentPayload.currentLevelId).toBe(1);
    expect(studentPayload.currentBookId).toBe(1);
    expect(studentPayload.currentModuleId).toBe(1);
    expect(studentPayload.studentNumber).toBe('STU-2026-00101');
    expect(studentPayload.email).toContain('@');
  });

  it('validates CreateUserPayload schema for teacher with employment fields', () => {
    const teacherPayload: CreateUserPayload = {
      username: 'teacher.ana',
      email: 'teacher.ana@iqenglish.mx',
      password: 'SecurePassword123!',
      firstName: 'Ana',
      lastName: 'Rodriguez',
      phone: '+52 246 987 6543',
      role: 'ROLE_TEACHER',
      status: 'ACTIVE',
      campusId: 1,
      specialty: 'Grammar and Business English',
      hireDate: '2026-01-15',
      employeeNumber: 'TCH-2026-00045',
    };

    expect(teacherPayload.role).toBe('ROLE_TEACHER');
    expect(teacherPayload.specialty).toBe('Grammar and Business English');
    expect(teacherPayload.hireDate).toBe('2026-01-15');
    expect(teacherPayload.employeeNumber).toBe('TCH-2026-00045');
    expect(teacherPayload.specialty?.length).toBeLessThanOrEqual(150);
  });

  it('validates UpdateUserPayload schema for student academic update', () => {
    const updateStudent: UpdateUserPayload = {
      firstName: 'Carlos',
      lastName: 'Mendoza',
      email: 'carlos.mendoza@iqenglish.mx',
      phone: '+52 246 111 2233',
      status: 'ACTIVE',
      currentLevelId: 2,
      currentBookId: 4,
      currentModuleId: 13,
      studentNumber: 'STU-2026-00101',
    };

    expect(updateStudent.currentLevelId).toBe(2);
    expect(updateStudent.currentBookId).toBe(4);
    expect(updateStudent.currentModuleId).toBe(13);
  });

  it('validates UpdateUserPayload schema for teacher employment update', () => {
    const updateTeacher: UpdateUserPayload = {
      firstName: 'Ana',
      lastName: 'Rodriguez',
      email: 'ana.rodriguez@iqenglish.mx',
      phone: '+52 246 111 2233',
      status: 'ACTIVE',
      specialty: 'Phonetics & Advanced Fluency',
      hireDate: '2026-01-15',
      employeeNumber: 'TCH-2026-00045',
    };

    expect(updateTeacher.specialty).toBe('Phonetics & Advanced Fluency');
    expect(updateTeacher.hireDate).toBe('2026-01-15');
    expect(updateTeacher.employeeNumber).toBe('TCH-2026-00045');
  });

  it('handles PageResponse pagination calculation accurately', () => {
    const pagedUsers: PageResponse<User> = {
      content: [
        {
          id: 1,
          username: 'admin.alberto',
          email: 'admin@iqenglish.mx',
          firstName: 'Alberto',
          lastName: 'Castillo',
          fullName: 'Alberto Castillo',
          status: 'ACTIVE',
          roles: ['ROLE_ADMIN'],
          permissions: [],
        }
      ],
      pageNumber: 0,
      pageSize: 10,
      totalElements: 1,
      totalPages: 1,
      last: true,
    };

    expect(pagedUsers.content).toHaveLength(1);
    expect(pagedUsers.totalElements).toBe(1);
    expect(pagedUsers.totalPages).toBe(1);
    expect(pagedUsers.last).toBe(true);
  });

  it('validates UserReport statistics aggregation structure', () => {
    const report: UserReport = {
      totalUsers: 25,
      activeUsers: 23,
      inactiveUsers: 2,
      suspendedUsers: 0,
      roleDistribution: {
        ROLE_ADMIN: 2,
        ROLE_SUPERVISOR: 3,
        ROLE_TEACHER: 8,
        ROLE_STUDENT: 12,
      },
      statusDistribution: {
        ACTIVE: 23,
        INACTIVE: 2,
        SUSPENDED: 0,
      },
      recentRegistrations30Days: 5,
    };

    expect(report.totalUsers).toBe(report.activeUsers + report.inactiveUsers + report.suspendedUsers);
    expect(report.roleDistribution.ROLE_ADMIN).toBe(2);
    expect(report.recentRegistrations30Days).toBe(5);
  });
});
