/**
 * Student Care Platform — Core Shared Types & API Contracts
 */

// ============================================================================
// 1. School Multi-Tenancy & Central Registry Types
// ============================================================================

export type SchoolStatus = 'PENDING_PROVISION' | 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED';

export interface SchoolRegistryEntry {
  id: string; // Unique identifier (e.g. 'sch_colombo_001')
  code: string; // Human-friendly code (e.g. 'CC-COL')
  name: string;
  timezone: string; // Default: 'Asia/Colombo'
  status: SchoolStatus;
  databaseName: string; // Dedicated tenant database name (e.g. 'sc_school_colombo_001')
  databaseHost?: string;
  databasePort?: number;
  createdAt: string;
  updatedAt: string;
}

export interface SchoolDatabaseConfig {
  schoolId: string;
  host: string;
  port: number;
  database: string;
  user: string;
  password?: string;
  ssl: boolean;
  poolMax?: number;
  idleTimeoutMillis?: number;
}

// ============================================================================
// 2. Identity & Access Roles
// ============================================================================

export type UserRole =
  | 'SUPER_ADMIN' // Platform-wide administrator
  | 'SCHOOL_ADMIN' // Administrative staff within a specific school
  | 'TEACHER' // School educator
  | 'PARENT'; // Parent or guardian

export interface AuthUserSummary {
  id: string;
  schoolId?: string; // Null for SUPER_ADMIN
  email: string;
  role: UserRole;
  fullName: string;
}

// ============================================================================
// 3. API Response Contracts
// ============================================================================

export interface ApiErrorDetail {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiErrorDetail;
  timestamp: string;
}

export interface HealthCheckResponse {
  status: 'ok' | 'degraded' | 'error';
  service: string;
  version: string;
  environment: string;
  timestamp: string;
  uptimeSeconds: number;
  timezone: string;
}

// ============================================================================
// 4. Domain Models (Foundational contracts for future phases)
// ============================================================================

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
export type AttendanceSource = 'MANUAL' | 'BIOMETRIC_FINGERPRINT';

export interface Student {
  id: string;
  schoolId: string;
  admissionNumber: string;
  firstName: string;
  lastName: string;
  grade: string;
  classSection: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceRecord {
  id: string;
  schoolId: string;
  studentId: string;
  date: string; // ISO date 'YYYY-MM-DD'
  status: AttendanceStatus;
  source: AttendanceSource;
  markedAt: string;
  markedByUserId: string;
}
