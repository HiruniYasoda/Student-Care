import { UserRole } from '@student-care/shared-types';

interface PortalCard {
  title: string;
  role: UserRole | 'PUBLIC';
  icon: string;
  description: string;
  status: string;
}

const portals: PortalCard[] = [
  {
    title: 'Public Portal',
    role: 'PUBLIC',
    icon: '🌐',
    description: 'School discovery, admissions information, and institutional announcements.',
    status: 'Ready for Staged Development',
  },
  {
    title: 'Teacher Portal',
    role: 'TEACHER',
    icon: '📚',
    description: 'Daily attendance marking, gradebook management, and classroom insights.',
    status: 'Ready for Staged Development',
  },
  {
    title: 'School Admin Portal',
    role: 'SCHOOL_ADMIN',
    icon: '🏫',
    description: 'Manage school staff, classes, biometric fingerprint devices, and schedules.',
    status: 'Ready for Staged Development',
  },
  {
    title: 'Platform Admin Portal',
    role: 'SUPER_ADMIN',
    icon: '⚙️',
    description: 'Manage Central Control Registry, tenant school databases, and global settings.',
    status: 'Ready for Staged Development',
  },
];

export default function HomePage() {
  return (
    <main className="container">
      <header>
        <div className="badge">
          <span className="badge-dot" />
          Foundation Finalized
        </div>
        <h1>Student Care Platform</h1>
        <p className="subtitle">
          Next.js + Express + React Native multi-tenant educational management system with dedicated
          PostgreSQL databases per school.
        </p>
      </header>

      <section className="grid">
        {portals.map((portal) => (
          <div key={portal.title} className="card">
            <div className="card-icon">{portal.icon}</div>
            <h2>{portal.title}</h2>
            <p>{portal.description}</p>
            <span className="card-tag">{portal.status}</span>
          </div>
        ))}
      </section>

      <section className="meta-section">
        <h3 className="meta-title">Platform Architecture Status</h3>
        <div className="meta-stats">
          <div className="stat-item">
            <span className="stat-label">Architecture</span>
            <span className="stat-value">Isolated PostgreSQL Per School</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Central Control DB</span>
            <span className="stat-value">School Registry & Safe Routing</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Default Timezone</span>
            <span className="stat-value">Asia/Colombo</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Parent Client</span>
            <span className="stat-value">React Native + Expo Mobile App</span>
          </div>
        </div>
      </section>
    </main>
  );
}
