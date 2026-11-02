# Employee Payroll Management System

**A Full Stack Web Application | Angular · Python Flask · Microsoft SQL Server · JWT Authentication**

## Project Overview

The Employee Payroll Management System is a full-stack web application developed to streamline employee payroll operations and provide employees with a centralized platform to access their employment and salary-related information.

The application enables authenticated employees to monitor attendance, review detailed salary breakdowns, access payslip history, track salary payments, and raise payment-related queries through an intuitive web interface.

Built using **Angular, Python Flask, and Microsoft SQL Server**, the project demonstrates practical implementation of frontend development, REST API integration, backend development, relational database management, and secure authentication.

## Key Features

### Employee Authentication & Security
- Implemented JWT-based authentication for secure employee login.
- Protected application routes using Angular route guards.
- Integrated authenticated API requests between frontend and backend.
- Implemented password hashing for secure credential storage.

### Employee Dashboard
- Developed a personalized employee dashboard.
- Displayed attendance and salary summaries.
- Provided quick navigation to essential payroll modules.

### Attendance & Leave Management
- Implemented monthly attendance tracking.
- Developed a calendar-based attendance overview.
- Displayed present, absent, leave, and holiday summaries.
- Provided access to recent attendance records.

### Salary Management
- Developed a detailed monthly salary breakdown.
- Displayed basic salary, house allowance, transport allowance, and overtime.
- Implemented individual deduction tracking, including income tax, provident fund, insurance, and other deductions.
- Displayed gross salary, total deductions, and calculated net salary.
- Integrated monthly salary history from the backend.

### Payslip Management
- Implemented monthly payslip history.
- Displayed payslips for successfully paid salary periods.
- Developed a detailed payslip view with earnings and deductions.
- Implemented browser-based printing and Save as PDF functionality.

### Payment Status Tracking
- Developed a payment history interface.
- Displayed paid and pending salary records.
- Implemented payment date and payment status tracking.
- Calculated total salary received from completed payments.

### Payment Query Management
- Developed a payment query submission form.
- Implemented query categorization and salary period selection.
- Integrated query submission with backend REST APIs.
- Displayed previously submitted queries and their current status.

## Technical Skills & Technologies

| Area | Technologies |
|---|---|
| Frontend Development | Angular, TypeScript |
| UI Development | HTML5, CSS3 |
| Backend Development | Python, Flask |
| Database | Microsoft SQL Server |
| Database Management | SQL Server Management Studio (SSMS) |
| Authentication | JSON Web Tokens (JWT) |
| API Development | RESTful APIs |
| API Integration | Angular HttpClient |
| Database Connectivity | SQLAlchemy, PyODBC |
| Development Tools | Visual Studio Code, PowerShell |

## System Architecture

The application follows a client-server architecture with three primary layers:

**1. Frontend – Angular**
- Handles user interaction, navigation, forms, and data presentation.
- Communicates with backend services through HTTP requests.
- Uses route guards and authentication services to manage protected access.

**2. Backend – Python Flask**
- Provides REST API endpoints for employee-related operations.
- Handles authentication and authorization using JWT.
- Processes salary, attendance, payslip, and payment query requests.
- Manages database operations through SQLAlchemy.

**3. Database – Microsoft SQL Server**
- Stores employee information and authentication credentials.
- Maintains attendance and salary records.
- Stores payslip and payment query information.
- Supports persistent application data management.

## Engineering Highlights

This project demonstrates practical application of:

- Full-stack application development using Angular and Flask.
- Designing and integrating RESTful API endpoints.
- Implementing JWT authentication and protected routes.
- Connecting Angular frontend services with Flask backend APIs.
- Relational database design and SQL Server integration.
- Implementing CRUD-based application workflows.
- Managing salary calculations and financial records.
- Handling asynchronous HTTP requests and API responses.
- Building reusable Angular components and services.
- Debugging and testing APIs using PowerShell.

## Future Enhancements

- Automated payslip PDF generation and storage.
- Email notifications for salary payment updates.
- Enhanced employee profile management.
- Password recovery and reset functionality.
- Advanced attendance and payroll reporting.
- Expanded payment query response and resolution workflows.

## Author

**Lizhone Remeh**

Full Stack Development | Angular | Python Flask | SQL Server

---

*Developed as a full-stack application to demonstrate practical software engineering skills, backend API development, database integration, and secure web application development.*
