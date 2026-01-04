// TypeScript interfaces for Zapsters Attendance System

export interface User {
    id: string;
    uid: string;
    email: string;
    name: string;
    role: 'admin' | 'student' | 'tutor';
    domainId?: string;
    batchId?: string;
    createdAt: Date | string;
}

export interface Domain {
    id: string;
    name: string;
    createdAt: Date | string;
}

export interface Batch {
    id: string;
    domainId: string;
    name: string;
    startDate: string;
    endDate: string;
    createdAt: Date | string;
}

export interface Session {
    id: string;
    domainId: string;
    batchId: string;
    date: string;
    time: string;
    meetLink: string;
    attendanceCode: string;
    codeExpiresAt: Date | string;
    createdAt: Date | string;
}

export interface AttendanceRecord {
    id: string;
    userId: string;
    sessionId: string;
    batchId: string;
    domainId: string;
    status: 'present' | 'absent';
    timestamp: Date | string;
}

export interface AttendanceStats {
    studentName: string;
    totalSessions: number;
    attendedSessions: number;
    percentage: number;
    isEligible: boolean;
    minRequired: number;
}

export interface LowAttendanceStudent {
    id: string;
    name: string;
    email: string;
    domainName: string;
    batchName: string;
    attendancePercentage: number;
}

export interface DashboardStats {
    totalDomains: number;
    totalBatches: number;
    totalStudents: number;
    studentsBelow75: number;
    averageAttendance: number;
    lowAttendanceStudents: LowAttendanceStudent[];
}

export interface StudentSession extends Session {
    attended: boolean;
}

export interface AuthContextType {
    user: User | null;
    loading: boolean;
    error: string | null;
    login: (email: string, password: string) => Promise<void>;
    loginWithGoogle: () => Promise<void>;
    loginWithMock: (email: string) => void;
    logout: () => Promise<void>;
}

export interface ApiResponse<T> {
    data?: T;
    error?: string;
    message?: string;
}

export interface FormErrors {
    [key: string]: string;
}
