import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, StudentProfile, TeacherProfile } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  studentProfile: StudentProfile | null;
  teacherProfile: TeacherProfile | null;
  token: string | null;
  isLoading: boolean;
  login: (username: string, password?: string) => Promise<void>;
  logout: () => void;
  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => boolean;
  switchDemoRole: (role: 'ROLE_STUDENT' | 'ROLE_TEACHER' | 'ROLE_SUPERVISOR' | 'ROLE_ADMIN') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [teacherProfile, setTeacherProfile] = useState<TeacherProfile | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('iq_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadUser() {
      if (token) {
        try {
          const userData = await api.get<User>('/auth/me');
          setUser(userData);
          // Load specific profile if student
          if (userData.roles.includes('ROLE_STUDENT')) {
            try {
              const summary = await api.get<any>('/reports/dashboard');
              if (summary.studentProfile) setStudentProfile(summary.studentProfile);
            } catch (e) {
              console.warn('Could not load student profile', e);
            }
          }
          if (userData.roles.includes('ROLE_TEACHER')) {
            try {
              const summary = await api.get<any>('/reports/dashboard');
              if (summary.teacherProfile) setTeacherProfile(summary.teacherProfile);
            } catch (e) {
              console.warn('Could not load teacher profile', e);
            }
          }
        } catch (err) {
          console.error('Session restore failed, logging out', err);
          logout();
        }
      }
      setIsLoading(false);
    }
    loadUser();
  }, [token]);

  const login = async (username: string, password = 'Password123!') => {
    setIsLoading(true);
    try {
      const resp = await api.post<any>('/auth/login', { username, password });
      const jwt = resp.token;
      localStorage.setItem('iq_token', jwt);
      setToken(jwt);

      const currentUser: User = {
        id: resp.userId,
        username: resp.username,
        email: resp.email,
        firstName: resp.fullName.split(' ')[0],
        lastName: resp.fullName.split(' ').slice(1).join(' '),
        fullName: resp.fullName,
        status: 'ACTIVE',
        roles: resp.roles,
        permissions: resp.permissions,
      };

      setUser(currentUser);
      if (resp.roles.includes('ROLE_STUDENT') && resp.profile) {
        setStudentProfile(resp.profile);
      } else if (resp.roles.includes('ROLE_TEACHER') && resp.profile) {
        setTeacherProfile(resp.profile);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('iq_token');
    setToken(null);
    setUser(null);
    setStudentProfile(null);
    setTeacherProfile(null);
  };

  const switchDemoRole = async (role: 'ROLE_STUDENT' | 'ROLE_TEACHER' | 'ROLE_SUPERVISOR' | 'ROLE_ADMIN') => {
    const userMap = {
      ROLE_STUDENT: 'student.carlos',
      ROLE_TEACHER: 'teacher.ana',
      ROLE_SUPERVISOR: 'supervisor.patricia',
      ROLE_ADMIN: 'admin.alberto',
    };
    await login(userMap[role], 'Password123!');
  };

  const hasRole = (roleName: string) => {
    if (!user || !user.roles) return false;
    const formatted = roleName.startsWith('ROLE_') ? roleName : `ROLE_${roleName}`;
    return user.roles.includes(formatted);
  };

  const hasPermission = (permissionName: string) => {
    if (!user || !user.permissions) return false;
    return user.permissions.includes(permissionName) || user.roles.includes('ROLE_ADMIN');
  };

  return (
    <AuthContext.Provider value={{
      user,
      studentProfile,
      teacherProfile,
      token,
      isLoading,
      login,
      logout,
      hasRole,
      hasPermission,
      switchDemoRole,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
