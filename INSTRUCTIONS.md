Overview
This document outlines the technical stack for the Bayet Catering Recruitment Platform, optimized for deployment on cPanel hosting.

Core Roles

1. Candidates
   Job seekers applying to Bayet Catering
   Complete profile and applications
   Upload documents
2. Administrators
   Manage applications
   Handle user management
   Access data and reports
   Authentication System
3. Candidate Authentication
   Login page
   Signup page
   Password reset functionality
4. Admin Authentication
   Separate login portal
   Admin signup (restricted)
   Password reset system
   Candidate Journey
5. Dashboard Pages
   Profile Tab
   Applications Tab (5-step process)
   Navigation bar (expandable)
6. Application Process (5 Steps)
   Step 1: Choix de Domain
   Selection from predefined domains
   Domain specialization
   Step 2: État Civil et Coordonnées
   Personal information
   Contact details
   Address information
   Step 3: Diplôme et Experience
   Educational background
   Work experience
   Certifications
   Step 4: Compétances
   Technical skills
   Soft skills
   Language proficiency
   Step 5: Document Upload
   Profile image
   CV upload
   Diploma/certificates
   Administrator Features
7. Dashboard
   Settings Tab
   Create new admin accounts
   Manage admin roles/permissions
   System configuration
   Applications Management Tab
   View all applications
   Filter applications
   Export data
8. Data Management
   Filtering Options
   By domain
   By experience
   By age
   By diploma
   By skills
   Export Formats
   XLSX
   CSV
   PDF
   Core Functions
9. User Management
   User registration
   Profile management
   Password management
   Role-based access control
10. Application Processing
    Multi-step form handling
    Document upload/storage
    Application status tracking
    Progress saving
11. Data Handling
    Form validation
    File type verification
    Database operations
    Data export
12. Administration
    User oversight
    Application review
    Data filtering
    Report generation
    Technical Components
13. Frontend Components
    Authentication forms
    Multi-step application wizard
    File upload interface
    Dashboard layouts
    Data tables
    Export tools
14. Backend Services
    Authentication service
    File handling service
    Data management service
    Export service
15. Database Schema
    Users table
    Applications table
    Documents table
    Domains table
    Skills table

16. Frontend Stack

a. Core Framework
• Next.js 14 (Pages Router)
• React 18
• TypeScript
• Tailwind CSS
• ShadCN/UI

b. State Management & Data Fetching
• Zustand - Simple state management
• TanStack Query - Server state management
• Axios - HTTP client

c. Form Management
• React Hook Form - Form handling
• Zod - Type-safe form validation
• React Multi Step Form - For application process

d. Authentication
• Custom JWT implementation
• Session management
• Password hashing & security

e. UI Components
• Lucide React - Icons
• React Hot Toast - Notifications
• TailwindCSS Animations
• React Loading Skeleton
• React DatePicker

f. File Handling
• React Dropzone - File uploads
• PDF.js - PDF handling
• xlsx - Excel file handling

2. Backend Stack

a. Core
• PHP 8.x
o PDO for database operations
o REST API implementation
o Session handling
b. Database
• MySQL
• PHP PDO for database operations
• Prepared statements for security
c. Security
• PHP password_hash()
• JWT implementation
• CORS headers
• Input validation
• XSS protection
d. File Handling
• PHP file upload handling
• File type validation
• Image processing

3. Development Environment

a. IDE & Extensions
• VS Code
o ESLint
o Prettier
o Tailwind CSS IntelliSense
o PHP Intelephense
o GitLens
b. Development Tools
• ESLint - Code linting
• Prettier - Code formatting
• Jest & React Testing Library - Testing
• Git - Version control
c. Package Management
• npm (frontend only)
d. Database Tools
• phpMyAdmin (provided by cPanel)
• MySQL Workbench (development)

4. Project Structure

5. Database Schema

6. Deployment Process
   a. Frontend Deployment
7. Build Next.js project as static:
8. npm run build
9. npm run export
10. Upload content of out directory to public_html/frontend
    b. Backend Deployment
11. Upload PHP files to public_html/api
12. Configure .htaccess for API routing
13. Set up database credentials
    c. Database Setup
14. Create database via cPanel
15. Import schema using phpMyAdmin
16. Set up database users and permissions

17. Security Considerations
    a. Frontend
    • JWT token storage
    • XSS prevention
    • Form validation
    • Secure file uploads
    b. Backend
    • Password hashing
    • SQL injection prevention
    • CORS configuration
    • File type validation
    • Rate limiting

18. Performance Optimization
    a. Frontend
    • Static page generation
    • Image optimization
    • Code splitting
    • Lazy loading
    b. Backend
    • Database indexing
    • Query optimization
    • File upload limits
    • Caching strategies

19. Required cPanel Features
    • PHP 8.x
    • MySQL databases
    • phpMyAdmin
    • File Manager
    • SSL/TLS
    • Cron Jobs (if needed)
    • Email accounts (for notifications)

20. Development Workflow

21. Local development using development environment
22. Testing in staging environment
23. Deployment to production via FTP/cPanel File Manager
24. Database management through phpMyAdmin
