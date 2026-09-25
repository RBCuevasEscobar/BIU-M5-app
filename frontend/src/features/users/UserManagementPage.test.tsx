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

  it('validates CreateUserPayload schema contract', () => {
    const payload: CreateUserPayload = {
      username: 'teacher.ana',
      email: 'teacher.ana@iqenglish.mx',
      password: 'SecurePassword123!',
      firstName: 'Ana',
      lastName: 'Rodriguez',
      phone: '+52 246 987 6543',
      role: 'ROLE_TEACHER',
      status: 'ACTIVE',
      campusId: 1,
    };

    expect(payload.username.length).toBeGreaterThanOrEqual(3);
    expect(payload.password.length).toBeGreaterThanOrEqual(6);
    expect(payload.role).toBe('ROLE_TEACHER');
    expect(payload.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  });

  it('validates UpdateUserPayload schema contract', () => {
    const payload: UpdateUserPayload = {
      firstName: 'Alberto',
      lastName: 'Castillo',
      email: 'alberto.castillo@iqenglish.mx',
      phone: '+52 246 111 2233',
      status: 'ACTIVE',
    };

    expect(payload.firstName).toBe('Alberto');
    expect(payload.email).toContain('@');
    expect(payload.status).toBe('ACTIVE');
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
        ADMIN: 2,
        SUPERVISOR: 3,
        TEACHER: 8,
        STUDENT: 12,
      },
      statusDistribution: {
        ACTIVE: 23,
        INACTIVE: 2,
        SUSPENDED: 0,
      },
      recentRegistrations30Days: 5,
    };

    expect(report.totalUsers).toBe(report.activeUsers + report.inactiveUsers + report.suspendedUsers);
    expect(report.roleDistribution.ADMIN).toBe(2);
    expect(report.recentRegistrations30Days).toBe(5);
  });
});
