import { describe, it, expect } from 'vitest';
import { 
  TutoringGroup, 
  CreateTutoringGroupPayload, 
  UpdateTutoringGroupPayload, 
  DuplicateGroupPayload, 
  GroupReport,
  Appointment 
} from '../../types';

describe('Group Management Model & Domain Logic (Phase 10)', () => {
  it('instantiates valid TutoringGroup object with complete attributes and occupancy logic', () => {
    const group: TutoringGroup = {
      id: 100,
      code: 'TUT-B2-01',
      name: 'Tutoring Book 2 - Lesson 5B Speaking',
      campusId: 1,
      campusName: 'Campus Tlaxcala',
      teacherId: 1,
      teacherName: 'Ana Garcia',
      bookId: 2,
      bookNumber: 2,
      bookTitle: 'Book 2 Elementary',
      moduleId: 8,
      moduleCode: 'MOD-05B',
      moduleTitle: 'Lesson 5B',
      capacity: 12,
      currentEnrollment: 6,
      availableSeats: 6,
      full: false,
      status: 'PUBLISHED',
      modality: 'PRESENTIAL',
      createdAt: '2026-09-25T10:00:00Z'
    };

    expect(group.id).toBe(100);
    expect(group.code).toBe('TUT-B2-01');
    expect(group.status).toBe('PUBLISHED');
    expect(group.availableSeats).toBe(group.capacity - group.currentEnrollment);
    expect(group.full).toBe(false);
  });

  it('validates enrolled students roster mapping for teacher reporting', () => {
    const enrolledStudents: Appointment[] = [
      {
        id: 501,
        appointmentNumber: 'APT-2026-0001',
        studentId: 10,
        studentName: 'Carlos Mendoza',
        studentNumber: 'STU-2026-00010',
        status: 'CONFIRMED',
        bookedAt: '2026-09-26T10:00:00Z',
        attendanceStatus: 'PRESENT',
        grade: 95.5,
        session: {
          id: 1,
          groupId: 100,
          groupCode: 'TUT-B2-01',
          groupName: 'Group 1',
          campusId: 1,
          campusName: 'Campus Tlaxcala',
          teacherId: 1,
          teacherName: 'Ana Garcia',
          bookId: 2,
          bookNumber: 2,
          bookTitle: 'Book 2',
          moduleId: 8,
          moduleCode: 'MOD-05B',
          moduleTitle: 'Lesson 5B',
          sessionDate: '2026-09-28',
          startTime: '10:00',
          endTime: '11:00',
          durationMinutes: 60,
          capacity: 12,
          currentEnrollment: 1,
          availableSeats: 11,
          full: false,
          modality: 'PRESENTIAL',
          status: 'SCHEDULED'
        }
      }
    ];

    expect(enrolledStudents).toHaveLength(1);
    expect(enrolledStudents[0].studentName).toBe('Carlos Mendoza');
    expect(enrolledStudents[0].studentNumber).toBe('STU-2026-00010');
    expect(enrolledStudents[0].attendanceStatus).toBe('PRESENT');
    expect(enrolledStudents[0].grade).toBe(95.5);
  });

  it('validates CreateTutoringGroupPayload schema contract', () => {
    const payload: CreateTutoringGroupPayload = {
      name: 'Tutoring Book 3 - Advance Speaking',
      campusId: 1,
      teacherId: 2,
      moduleId: 12,
      capacity: 10,
      modality: 'ONLINE',
      initialSessionDate: '2026-09-28',
      initialStartTime: '17:00',
      durationMinutes: 60,
      roomOrLink: 'https://meet.google.com/abc-defg-hij'
    };

    expect(payload.name.length).toBeGreaterThan(3);
    expect(payload.capacity).toBeGreaterThan(0);
    expect(payload.campusId).toBe(1);
    expect(payload.modality).toBe('ONLINE');
    expect(payload.roomOrLink).toContain('meet.google.com');
  });

  it('validates UpdateTutoringGroupPayload integrity and capacity constraints', () => {
    const payload: UpdateTutoringGroupPayload = {
      name: 'Updated Group Name',
      campusId: 2,
      teacherId: 3,
      moduleId: 9,
      capacity: 15,
      modality: 'PRESENTIAL',
      status: 'PUBLISHED'
    };

    expect(payload.capacity).toBeGreaterThanOrEqual(1);
    expect(payload.status).toBe('PUBLISHED');
    expect(payload.teacherId).toBe(3);
  });

  it('validates DuplicateGroupPayload structural duplication contract', () => {
    const payload: DuplicateGroupPayload = {
      newName: 'Tutoring Book 2 - Lesson 5B (Copia)',
      newTeacherId: 2,
      newSessionDate: '2026-10-05',
      newStartTime: '11:00',
      newEndTime: '12:00'
    };

    expect(payload.newName).toContain('(Copia)');
    expect(payload.newTeacherId).toBe(2);
    expect(payload.newStartTime).toBe('11:00');
  });

  it('validates GroupReport statistics and operational KPI aggregation', () => {
    const report: GroupReport = {
      generatedAt: '2026-09-25T19:00:00Z',
      generatedBy: 'admin.alberto',
      scope: 'ALL_GROUPS',
      totalGroups: 2,
      totalCapacity: 24,
      totalEnrolled: 18,
      totalAvailableSeats: 6,
      averageOccupancyPercentage: 75.0,
      publishedCount: 2,
      inactiveCount: 0,
      cancelledCount: 0,
      items: [
        {
          groupId: 1,
          code: 'TUT-B2-01',
          name: 'Group 1',
          campusName: 'Campus Tlaxcala',
          teacherName: 'Ana Garcia',
          teacherEmail: 'ana@iqenglish.mx',
          bookTitle: 'Book 2',
          bookNumber: 2,
          moduleCode: 'MOD-05B',
          moduleTitle: 'Lesson 5B',
          topicTitle: 'Speaking',
          capacity: 12,
          currentEnrollment: 10,
          availableSeats: 2,
          occupancyPercentage: 83.33,
          status: 'PUBLISHED',
          modality: 'PRESENTIAL',
          sessionsCount: 2,
          createdAt: '2026-09-25T10:00:00Z'
        },
        {
          groupId: 2,
          code: 'TUT-B2-02',
          name: 'Group 2',
          campusName: 'Campus Tlaxcala',
          teacherName: 'Roberto Sanchez',
          teacherEmail: 'roberto@iqenglish.mx',
          bookTitle: 'Book 2',
          bookNumber: 2,
          moduleCode: 'MOD-05B',
          moduleTitle: 'Lesson 5B',
          topicTitle: 'Grammar',
          capacity: 12,
          currentEnrollment: 8,
          availableSeats: 4,
          occupancyPercentage: 66.67,
          status: 'PUBLISHED',
          modality: 'PRESENTIAL',
          sessionsCount: 1,
          createdAt: '2026-09-25T11:00:00Z'
        }
      ]
    };

    expect(report.totalGroups).toBe(report.items.length);
    expect(report.totalCapacity).toBe(report.items.reduce((acc, i) => acc + i.capacity, 0));
    expect(report.totalEnrolled).toBe(report.items.reduce((acc, i) => acc + i.currentEnrollment, 0));
    expect(report.totalAvailableSeats).toBe(report.totalCapacity - report.totalEnrolled);
    expect(report.scope).toBe('ALL_GROUPS');
  });
});
