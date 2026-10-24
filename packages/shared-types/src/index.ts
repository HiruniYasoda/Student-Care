/**
 * Student Care Platform — Core Shared Types & API Contracts
 */

// ============================================================================
// 1. School Multi-Tenancy & Central Registry Types
// ============================================================================

export type SchoolStatus =
  'PENDING_PROVISION' | 'ACTIVE' | 'SUSPENDED' | 'MAINTENANCE' | 'ARCHIVED';

export interface DatabaseServerSummary {
  id: string;
  serverCode: string;
  host: string;
  port: number;
  sslEnabled: boolean;
  maxTenantLimit: number;
  isActive: boolean;
}

export interface SchoolRegistryEntry {
  id: string; // Unique identifier (e.g. 'sch_colombo_royal_001')
  code: string; // Human-friendly code (e.g. 'RC-COL')
  name: string;
  legalEntityName?: string;
  logoUrl?: string;
  contactEmail: string;
  contactPhone: string;
  timezone: string; // Default: 'Asia/Colombo'
  status: SchoolStatus;
  serverId?: string;
  databaseName: string; // Dedicated tenant database name (e.g. 'sc_school_sch_colombo_royal_001')
  databaseHost?: string;
  databasePort?: number;
  provisionedAt?: string;
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
// 2. Automated Provisioning Types
// ============================================================================

export type ProvisioningJobStatus =
  'QUEUED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'ROLLED_BACK';

export type ProvisioningStep =
  | 'JOB_INITIALIZED'
  | 'DATABASE_CREATION'
  | 'SCHEMA_MIGRATION'
  | 'DEFAULT_DATA_SEEDING'
  | 'INTEGRITY_VERIFICATION'
  | 'TENANT_ACTIVATION'
  | 'FAILED_NEEDS_CLEANUP';

export interface ProvisioningJobSummary {
  id: string;
  schoolId: string;
  targetDatabaseName: string;
  status: ProvisioningJobStatus;
  currentStep: ProvisioningStep;
  retryCount: number;
  failureReason?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
}

// ============================================================================
// 3. Identity & Access Roles
// ============================================================================

export type UserRole =
  | 'SUPER_ADMIN' // Platform-wide administrator
  | 'SCHOOL_ADMIN' // Administrative staff within a specific school
  | 'PRINCIPAL'
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
// 4. API Response Contracts
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
// 5. Domain Models (Foundational contracts for future phases)
// ============================================================================

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY' | 'EXCUSED';
export type AttendanceSource =
  'BIOMETRIC_TERMINAL' | 'TEACHER_MANUAL' | 'ADMIN_CORRECTION' | 'SYSTEM_AUTOMATIC_ABSENCE';

export interface Student {
  id: string;
  schoolId: string;
  admissionNumber: string;
  firstName: string;
  lastName: string;
  fullName: string;
  grade: string;
  classSection: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Guardian {
  id: string;
  firstName: string;
  lastName: string;
  relationship: string;
  phonePrimary: string;
  phoneSecondary?: string;
  email?: string;
  isEmergencyContact: boolean;
}

export interface AttendanceRecord {
  id: string;
  schoolId: string;
  studentId: string;
  date: string; // ISO date 'YYYY-MM-DD'
  status: AttendanceStatus;
  source: AttendanceSource;
  checkInTime?: string;
  checkOutTime?: string;
  lateMinutes?: number;
  markedAt: string;
  markedByUserId?: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  targetType: 'ALL_SCHOOL' | 'SPECIFIC_GRADES' | 'SPECIFIC_SECTIONS' | 'INDIVIDUAL_STUDENTS';
  publishedAt: string;
  isActive: boolean;
}
