---
title: 'Building My First Web Application: Lessons from a Student Developer'
cover: '../../assets/blog-placeholder-4.jpg'
coverAlt: 'Student web development project with JavaScript, HTML, and CSS code examples'
description: 'My experience building a web application as a Computer Systems Engineering student - from planning to deployment, including code examples and lessons learned'
pubDate: 2024-12-28
heroImage: '../../assets/blog-placeholder-4.jpg'
---

Building my first substantial web application was both exciting and terrifying. As a Computer Systems Engineering student, I had solid foundations in C and Python, but web development felt like a completely different world. Here's the story of how I built a Student Grade Tracker web app, what I learned, and the mistakes I made along the way.

## The Idea: Student Grade Tracker

The idea came from a personal need. Like many students, I was using spreadsheets to track my grades across different courses, but I wanted something more interactive and accessible from anywhere. I decided to build a web application that would:

- Track grades for multiple courses
- Calculate GPA automatically
- Visualize grade trends over time
- Set grade goals and track progress
- Work on both desktop and mobile

## Planning Phase: From Idea to Architecture

Before writing any code, I spent time planning the application structure. This planning phase saved me countless hours later.

### User Stories
```
As a student, I want to:
1. Add new courses with credit hours
2. Input grades for assignments and exams
3. See my current GPA
4. Visualize my grade trends
5. Set target grades for courses
6. Access my data from any device
```

### Technology Stack
After researching different options, I chose:
- **Frontend**: HTML5, CSS3, Vanilla JavaScript (to understand fundamentals)
- **Backend**: Node.js with Express (JavaScript everywhere)
- **Database**: SQLite (simple to start with)
- **Deployment**: Heroku (free tier for students)

### Database Design
```sql
-- courses table
CREATE TABLE courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    credit_hours INTEGER NOT NULL,
    target_grade REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- assignments table
CREATE TABLE assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id INTEGER,
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- 'assignment', 'exam', 'project', etc.
    grade REAL NOT NULL,
    max_points REAL NOT NULL,
    weight REAL DEFAULT 1.0,
    date_submitted DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses (id)
);
```

## Development Phase: Building the Application

### Setting Up the Backend

First, I created the server using Node.js and Express:

```javascript
// server.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize SQLite database
const db = new sqlite3.Database('grades.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database');
        initializeDatabase();
    }
});

function initializeDatabase() {
    // Create tables if they don't exist
    db.serialize(() => {
        db.run(`
            CREATE TABLE IF NOT EXISTS courses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                code TEXT NOT NULL,
                credit_hours INTEGER NOT NULL,
                target_grade REAL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        db.run(`
            CREATE TABLE IF NOT EXISTS assignments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                course_id INTEGER,
                name TEXT NOT NULL,
                type TEXT NOT NULL,
                grade REAL NOT NULL,
                max_points REAL NOT NULL,
                weight REAL DEFAULT 1.0,
                date_submitted DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (course_id) REFERENCES courses (id)
            )
        `);
    });
}

// API Routes

// Get all courses
app.get('/api/courses', (req, res) => {
    const query = `
        SELECT c.*, 
               COUNT(a.id) as assignment_count,
               AVG(a.grade / a.max_points * 100) as current_average
        FROM courses c
        LEFT JOIN assignments a ON c.id = a.course_id
        GROUP BY c.id
        ORDER BY c.created_at DESC
    `;
    
    db.all(query, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Add new course
app.post('/api/courses', (req, res) => {
    const { name, code, credit_hours, target_grade } = req.body;
    
    if (!name || !code || !credit_hours) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const query = 'INSERT INTO courses (name, code, credit_hours, target_grade) VALUES (?, ?, ?, ?)';
    
    db.run(query, [name, code, credit_hours, target_grade], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ id: this.lastID, message: 'Course added successfully' });
    });
});

// Get assignments for a course
app.get('/api/courses/:courseId/assignments', (req, res) => {
    const courseId = req.params.courseId;
    const query = 'SELECT * FROM assignments WHERE course_id = ? ORDER BY date_submitted DESC';
    
    db.all(query, [courseId], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Add assignment
app.post('/api/assignments', (req, res) => {
    const { course_id, name, type, grade, max_points, weight } = req.body;
    
    if (!course_id || !name || !type || grade === undefined || !max_points) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const query = `
        INSERT INTO assignments (course_id, name, type, grade, max_points, weight) 
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    db.run(query, [course_id, name, type, grade, max_points, weight || 1.0], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ id: this.lastID, message: 'Assignment added successfully' });
    });
});

// Calculate GPA
app.get('/api/gpa', (req, res) => {
    const query = `
        SELECT 
            c.credit_hours,
            AVG(a.grade / a.max_points * 100) as course_average
        FROM courses c
        INNER JOIN assignments a ON c.id = a.course_id
        GROUP BY c.id, c.credit_hours
        HAVING course_average IS NOT NULL
    `;
    
    db.all(query, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        let totalGradePoints = 0;
        let totalCreditHours = 0;
        
        rows.forEach(row => {
            const gradePoint = convertToGradePoint(row.course_average);
            totalGradePoints += gradePoint * row.credit_hours;
            totalCreditHours += row.credit_hours;
        });
        
        const gpa = totalCreditHours > 0 ? totalGradePoints / totalCreditHours : 0;
        
        res.json({ 
            gpa: Math.round(gpa * 100) / 100,
            totalCreditHours: totalCreditHours
        });
    });
});

function convertToGradePoint(percentage) {
    if (percentage >= 90) return 4.0;
    if (percentage >= 80) return 3.0;
    if (percentage >= 70) return 2.0;
    if (percentage >= 60) return 1.0;
    return 0.0;
}

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
```

### Building the Frontend

The frontend was where I really learned about user experience and responsive design:

```html
<!-- public/index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Student Grade Tracker</title>
    <link rel="stylesheet" href="styles.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>
    <div class="app-container">
        <header class="header">
            <h1>📚 Grade Tracker</h1>
            <div class="gpa-display">
                <span class="gpa-label">Current GPA:</span>
                <span class="gpa-value" id="currentGPA">--</span>
            </div>
        </header>

        <nav class="nav-tabs">
            <button class="tab-button active" data-tab="dashboard">Dashboard</button>
            <button class="tab-button" data-tab="courses">Courses</button>
            <button class="tab-button" data-tab="assignments">Assignments</button>
            <button class="tab-button" data-tab="analytics">Analytics</button>
        </nav>

        <main class="main-content">
            <!-- Dashboard Tab -->
            <div class="tab-content active" id="dashboard">
                <div class="dashboard-grid">
                    <div class="card">
                        <h3>Quick Stats</h3>
                        <div class="stats-grid">
                            <div class="stat-item">
                                <span class="stat-value" id="totalCourses">0</span>
                                <span class="stat-label">Courses</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-value" id="totalAssignments">0</span>
                                <span class="stat-label">Assignments</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-value" id="averageGrade">0%</span>
                                <span class="stat-label">Avg Grade</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="card">
                        <h3>Recent Grades</h3>
                        <div id="recentGrades">
                            <p class="no-data">No recent grades to display</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Courses Tab -->
            <div class="tab-content" id="courses">
                <div class="section-header">
                    <h2>My Courses</h2>
                    <button class="btn btn-primary" id="addCourseBtn">Add Course</button>
                </div>
                <div class="courses-grid" id="coursesGrid">
                    <!-- Courses will be loaded here -->
                </div>
            </div>

            <!-- Assignments Tab -->
            <div class="tab-content" id="assignments">
                <div class="section-header">
                    <h2>Assignments</h2>
                    <button class="btn btn-primary" id="addAssignmentBtn">Add Assignment</button>
                </div>
                <div class="assignments-container" id="assignmentsContainer">
                    <!-- Assignments will be loaded here -->
                </div>
            </div>

            <!-- Analytics Tab -->
            <div class="tab-content" id="analytics">
                <div class="section-header">
                    <h2>Grade Analytics</h2>
                </div>
                <div class="analytics-grid">
                    <div class="card">
                        <h3>Grade Trend</h3>
                        <canvas id="gradeTrendChart" width="400" height="200"></canvas>
                    </div>
                    <div class="card">
                        <h3>Course Performance</h3>
                        <canvas id="coursePerformanceChart" width="400" height="200"></canvas>
                    </div>
                </div>
            </div>
        </main>
    </div>

    <!-- Modal for adding courses -->
    <div class="modal" id="courseModal">
        <div class="modal-content">
            <span class="close">&times;</span>
            <h3>Add New Course</h3>
            <form id="courseForm">
                <div class="form-group">
                    <label for="courseName">Course Name:</label>
                    <input type="text" id="courseName" required>
                </div>
                <div class="form-group">
                    <label for="courseCode">Course Code:</label>
                    <input type="text" id="courseCode" required>
                </div>
                <div class="form-group">
                    <label for="creditHours">Credit Hours:</label>
                    <input type="number" id="creditHours" min="1" max="6" required>
                </div>
                <div class="form-group">
                    <label for="targetGrade">Target Grade (%):</label>
                    <input type="number" id="targetGrade" min="0" max="100">
                </div>
                <button type="submit" class="btn btn-primary">Add Course</button>
            </form>
        </div>
    </div>

    <!-- Modal for adding assignments -->
    <div class="modal" id="assignmentModal">
        <div class="modal-content">
            <span class="close">&times;</span>
            <h3>Add New Assignment</h3>
            <form id="assignmentForm">
                <div class="form-group">
                    <label for="assignmentCourse">Course:</label>
                    <select id="assignmentCourse" required>
                        <option value="">Select a course</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="assignmentName">Assignment Name:</label>
                    <input type="text" id="assignmentName" required>
                </div>
                <div class="form-group">
                    <label for="assignmentType">Type:</label>
                    <select id="assignmentType" required>
                        <option value="assignment">Assignment</option>
                        <option value="exam">Exam</option>
                        <option value="project">Project</option>
                        <option value="quiz">Quiz</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="assignmentGrade">Grade Received:</label>
                    <input type="number" id="assignmentGrade" step="0.1" min="0" required>
                </div>
                <div class="form-group">
                    <label for="maxPoints">Maximum Points:</label>
                    <input type="number" id="maxPoints" step="0.1" min="0.1" required>
                </div>
                <div class="form-group">
                    <label for="assignmentWeight">Weight:</label>
                    <input type="number" id="assignmentWeight" step="0.1" min="0.1" value="1.0">
                </div>
                <button type="submit" class="btn btn-primary">Add Assignment</button>
            </form>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="app.js"></script>
</body>
</html>
```

### JavaScript Application Logic

The frontend JavaScript handled all user interactions and API calls:

```javascript
// public/app.js
class GradeTracker {
    constructor() {
        this.courses = [];
        this.assignments = [];
        this.currentTab = 'dashboard';
        this.charts = {};
        
        this.init();
    }
    
    async init() {
        this.setupEventListeners();
        await this.loadData();
        this.renderDashboard();
        this.updateGPA();
    }
    
    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });
        
        // Add course button
        document.getElementById('addCourseBtn').addEventListener('click', () => {
            this.showCourseModal();
        });
        
        // Add assignment button
        document.getElementById('addAssignmentBtn').addEventListener('click', () => {
            this.showAssignmentModal();
        });
        
        // Form submissions
        document.getElementById('courseForm').addEventListener('submit', (e) => {
            this.handleCourseSubmit(e);
        });
        
        document.getElementById('assignmentForm').addEventListener('submit', (e) => {
            this.handleAssignmentSubmit(e);
        });
        
        // Modal close buttons
        document.querySelectorAll('.modal .close').forEach(closeBtn => {
            closeBtn.addEventListener('click', (e) => {
                e.target.closest('.modal').style.display = 'none';
            });
        });
        
        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        });
    }
    
    async loadData() {
        try {
            // Load courses
            const coursesResponse = await fetch('/api/courses');
            this.courses = await coursesResponse.json();
            
            // Load all assignments
            this.assignments = [];
            for (const course of this.courses) {
                const assignmentsResponse = await fetch(`/api/courses/${course.id}/assignments`);
                const courseAssignments = await assignmentsResponse.json();
                this.assignments.push(...courseAssignments);
            }
            
        } catch (error) {
            console.error('Error loading data:', error);
            this.showNotification('Error loading data', 'error');
        }
    }
    
    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');
        
        this.currentTab = tabName;
        
        // Render content based on tab
        switch (tabName) {
            case 'dashboard':
                this.renderDashboard();
                break;
            case 'courses':
                this.renderCourses();
                break;
            case 'assignments':
                this.renderAssignments();
                break;
            case 'analytics':
                this.renderAnalytics();
                break;
        }
    }
    
    renderDashboard() {
        // Update stats
        document.getElementById('totalCourses').textContent = this.courses.length;
        document.getElementById('totalAssignments').textContent = this.assignments.length;
        
        // Calculate average grade
        if (this.assignments.length > 0) {
            const avgGrade = this.assignments.reduce((sum, assignment) => {
                return sum + (assignment.grade / assignment.max_points * 100);
            }, 0) / this.assignments.length;
            document.getElementById('averageGrade').textContent = `${avgGrade.toFixed(1)}%`;
        }
        
        // Show recent grades
        const recentGrades = this.assignments
            .sort((a, b) => new Date(b.date_submitted) - new Date(a.date_submitted))
            .slice(0, 5);
            
        const recentGradesContainer = document.getElementById('recentGrades');
        
        if (recentGrades.length === 0) {
            recentGradesContainer.innerHTML = '<p class="no-data">No recent grades to display</p>';
        } else {
            recentGradesContainer.innerHTML = recentGrades.map(assignment => {
                const course = this.courses.find(c => c.id === assignment.course_id);
                const percentage = (assignment.grade / assignment.max_points * 100).toFixed(1);
                
                return `
                    <div class="recent-grade-item">
                        <div class="grade-info">
                            <span class="assignment-name">${assignment.name}</span>
                            <span class="course-name">${course ? course.code : 'Unknown'}</span>
                        </div>
                        <div class="grade-score ${this.getGradeClass(percentage)}">
                            ${percentage}%
                        </div>
                    </div>
                `;
            }).join('');
        }
    }
    
    renderCourses() {
        const coursesGrid = document.getElementById('coursesGrid');
        
        if (this.courses.length === 0) {
            coursesGrid.innerHTML = '<p class="no-data">No courses added yet. Click "Add Course" to get started!</p>';
            return;
        }
        
        coursesGrid.innerHTML = this.courses.map(course => {
            const courseAssignments = this.assignments.filter(a => a.course_id === course.id);
            const currentAverage = course.current_average ? course.current_average.toFixed(1) : 'N/A';
            const progressToTarget = course.target_grade ? 
                (course.current_average / course.target_grade * 100).toFixed(0) : null;
            
            return `
                <div class="course-card">
                    <div class="course-header">
                        <h3>${course.name}</h3>
                        <span class="course-code">${course.code}</span>
                    </div>
                    <div class="course-stats">
                        <div class="stat-row">
                            <span>Credit Hours:</span>
                            <span>${course.credit_hours}</span>
                        </div>
                        <div class="stat-row">
                            <span>Current Average:</span>
                            <span class="${this.getGradeClass(currentAverage)}">${currentAverage}%</span>
                        </div>
                        <div class="stat-row">
                            <span>Assignments:</span>
                            <span>${courseAssignments.length}</span>
                        </div>
                        ${course.target_grade ? `
                            <div class="stat-row">
                                <span>Target Grade:</span>
                                <span>${course.target_grade}%</span>
                            </div>
                            ${progressToTarget ? `
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: ${Math.min(progressToTarget, 100)}%"></div>
                                </div>
                            ` : ''}
                        ` : ''}
                    </div>
                    <div class="course-actions">
                        <button class="btn btn-small" onclick="gradeTracker.viewCourseDetails(${course.id})">
                            View Details
                        </button>
                        <button class="btn btn-small btn-secondary" onclick="gradeTracker.deleteCourse(${course.id})">
                            Delete
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    renderAssignments() {
        const container = document.getElementById('assignmentsContainer');
        
        if (this.assignments.length === 0) {
            container.innerHTML = '<p class="no-data">No assignments added yet. Click "Add Assignment" to get started!</p>';
            return;
        }
        
        // Group assignments by course
        const assignmentsByCourse = this.assignments.reduce((groups, assignment) => {
            const course = this.courses.find(c => c.id === assignment.course_id);
            const courseName = course ? course.name : 'Unknown Course';
            
            if (!groups[courseName]) {
                groups[courseName] = [];
            }
            groups[courseName].push(assignment);
            return groups;
        }, {});
        
        container.innerHTML = Object.entries(assignmentsByCourse).map(([courseName, assignments]) => {
            const sortedAssignments = assignments.sort((a, b) => 
                new Date(b.date_submitted) - new Date(a.date_submitted)
            );
            
            return `
                <div class="course-assignments">
                    <h3 class="course-title">${courseName}</h3>
                    <div class="assignments-list">
                        ${sortedAssignments.map(assignment => {
                            const percentage = (assignment.grade / assignment.max_points * 100).toFixed(1);
                            const date = new Date(assignment.date_submitted).toLocaleDateString();
                            
                            return `
                                <div class="assignment-item">
                                    <div class="assignment-info">
                                        <span class="assignment-name">${assignment.name}</span>
                                        <span class="assignment-meta">${assignment.type} • ${date}</span>
                                    </div>
                                    <div class="assignment-grade">
                                        <span class="grade-score ${this.getGradeClass(percentage)}">
                                            ${assignment.grade}/${assignment.max_points} (${percentage}%)
                                        </span>
                                        <button class="btn btn-small btn-secondary" 
                                                onclick="gradeTracker.deleteAssignment(${assignment.id})">
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        }).join('');
    }
    
    renderAnalytics() {
        this.renderGradeTrendChart();
        this.renderCoursePerformanceChart();
    }
    
    renderGradeTrendChart() {
        const ctx = document.getElementById('gradeTrendChart').getContext('2d');
        
        // Prepare data
        const sortedAssignments = this.assignments
            .sort((a, b) => new Date(a.date_submitted) - new Date(b.date_submitted));
        
        const data = {
            labels: sortedAssignments.map(a => new Date(a.date_submitted).toLocaleDateString()),
            datasets: [{
                label: 'Grade %',
                data: sortedAssignments.map(a => (a.grade / a.max_points * 100).toFixed(1)),
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                tension: 0.1
            }]
        };
        
        if (this.charts.gradeTrend) {
            this.charts.gradeTrend.destroy();
        }
        
        this.charts.gradeTrend = new Chart(ctx, {
            type: 'line',
            data: data,
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Grade Trend Over Time'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    }
    
    renderCoursePerformanceChart() {
        const ctx = document.getElementById('coursePerformanceChart').getContext('2d');
        
        // Calculate average grade per course
        const courseAverages = this.courses
            .filter(course => course.current_average !== null)
            .map(course => ({
                name: course.code,
                average: course.current_average
            }));
        
        const data = {
            labels: courseAverages.map(c => c.name),
            datasets: [{
                label: 'Course Average',
                data: courseAverages.map(c => c.average.toFixed(1)),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(255, 205, 86, 0.8)',
                    'rgba(75, 192, 192, 0.8)',
                    'rgba(153, 102, 255, 0.8)',
                    'rgba(255, 159, 64, 0.8)'
                ]
            }]
        };
        
        if (this.charts.coursePerformance) {
            this.charts.coursePerformance.destroy();
        }
        
        this.charts.coursePerformance = new Chart(ctx, {
            type: 'bar',
            data: data,
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Performance by Course'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    }
    
    getGradeClass(percentage) {
        const grade = parseFloat(percentage);
        if (grade >= 90) return 'grade-a';
        if (grade >= 80) return 'grade-b';
        if (grade >= 70) return 'grade-c';
        if (grade >= 60) return 'grade-d';
        return 'grade-f';
    }
    
    async updateGPA() {
        try {
            const response = await fetch('/api/gpa');
            const data = await response.json();
            document.getElementById('currentGPA').textContent = data.gpa.toFixed(2);
        } catch (error) {
            console.error('Error updating GPA:', error);
        }
    }
    
    showCourseModal() {
        document.getElementById('courseModal').style.display = 'block';
    }
    
    showAssignmentModal() {
        // Populate course dropdown
        const courseSelect = document.getElementById('assignmentCourse');
        courseSelect.innerHTML = '<option value="">Select a course</option>' +
            this.courses.map(course => 
                `<option value="${course.id}">${course.code} - ${course.name}</option>`
            ).join('');
        
        document.getElementById('assignmentModal').style.display = 'block';
    }
    
    async handleCourseSubmit(e) {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('courseName').value,
            code: document.getElementById('courseCode').value,
            credit_hours: parseInt(document.getElementById('creditHours').value),
            target_grade: parseFloat(document.getElementById('targetGrade').value) || null
        };
        
        try {
            const response = await fetch('/api/courses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });
            
            if (response.ok) {
                await this.loadData();
                this.renderCourses();
                this.updateGPA();
                document.getElementById('courseModal').style.display = 'none';
                document.getElementById('courseForm').reset();
                this.showNotification('Course added successfully!', 'success');
            } else {
                throw new Error('Failed to add course');
            }
        } catch (error) {
            console.error('Error adding course:', error);
            this.showNotification('Error adding course', 'error');
        }
    }
    
    async handleAssignmentSubmit(e) {
        e.preventDefault();
        
        const formData = {
            course_id: parseInt(document.getElementById('assignmentCourse').value),
            name: document.getElementById('assignmentName').value,
            type: document.getElementById('assignmentType').value,
            grade: parseFloat(document.getElementById('assignmentGrade').value),
            max_points: parseFloat(document.getElementById('maxPoints').value),
            weight: parseFloat(document.getElementById('assignmentWeight').value)
        };
        
        try {
            const response = await fetch('/api/assignments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });
            
            if (response.ok) {
                await this.loadData();
                this.renderAssignments();
                this.renderDashboard();
                this.updateGPA();
                document.getElementById('assignmentModal').style.display = 'none';
                document.getElementById('assignmentForm').reset();
                this.showNotification('Assignment added successfully!', 'success');
            } else {
                throw new Error('Failed to add assignment');
            }
        } catch (error) {
            console.error('Error adding assignment:', error);
            this.showNotification('Error adding assignment', 'error');
        }
    }
    
    showNotification(message, type) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Initialize the application
const gradeTracker = new GradeTracker();
```

## Challenges and Solutions

### Challenge 1: Responsive Design
Making the app work on both desktop and mobile was harder than expected.

**Solution**: Used CSS Grid and Flexbox with mobile-first approach:

```css
/* Responsive design approach */
.courses-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
}

@media (min-width: 768px) {
    .courses-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (min-width: 1024px) {
    .courses-grid {
        grid-template-columns: repeat(3, 1fr);
    }
}
```

### Challenge 2: Data Persistence
Initially lost all data on page refresh.

**Solution**: Implemented proper database with SQLite and API endpoints.

### Challenge 3: User Experience
The initial interface was confusing and hard to navigate.

**Solution**: Added clear visual feedback, loading states, and intuitive navigation:

```javascript
// Loading state management
function showLoading() {
    document.body.classList.add('loading');
}

function hideLoading() {
    document.body.classList.remove('loading');
}

// Success/error notifications
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.remove(), 3000);
}
```

## Deployment Journey

### Local Development
```bash
# Set up the project
npm init -y
npm install express sqlite3 cors

# Start development server
node server.js
```

### Preparing for Production
```json
{
  "name": "student-grade-tracker",
  "version": "1.0.0",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "engines": {
    "node": "14.x"
  }
}
```

### Heroku Deployment
```bash
# Initialize git repository
git init
git add .
git commit -m "Initial commit"

# Create Heroku app
heroku create my-grade-tracker

# Deploy
git push heroku main
```

## Lessons Learned

### Technical Lessons

1. **Plan Database Schema Early**: Changes later require complex migrations
2. **API Design Matters**: RESTful endpoints make frontend development easier
3. **Error Handling is Crucial**: Always validate input and handle edge cases
4. **Responsive Design from Start**: Mobile-first approach saves time later

### Soft Skills Developed

1. **Problem Decomposition**: Breaking large features into small, manageable tasks
2. **User-Centered Thinking**: Considering how real users would interact with the app
3. **Documentation**: Writing clear comments and README files
4. **Version Control**: Using Git effectively for managing changes

### Code Quality Insights

```javascript
// Before: Messy, hard to maintain
function addGrade(course, assignment, grade, maxPoints) {
    // All logic mixed together
    const percentage = grade / maxPoints * 100;
    courses[course].assignments.push({
        name: assignment,
        grade: grade,
        maxPoints: maxPoints,
        percentage: percentage
    });
    updateUI();
    calculateGPA();
    saveToLocalStorage();
}

// After: Clean, separated concerns
class GradeManager {
    addAssignment(courseId, assignmentData) {
        const validatedData = this.validateAssignment(assignmentData);
        const savedAssignment = this.saveAssignment(courseId, validatedData);
        this.notifyUI('assignment-added', savedAssignment);
        return savedAssignment;
    }
    
    validateAssignment(data) {
        if (!data.name || !data.grade || !data.maxPoints) {
            throw new Error('Missing required fields');
        }
        return data;
    }
    
    saveAssignment(courseId, data) {
        // Save to database
        return this.database.insertAssignment(courseId, data);
    }
}
```

## Future Improvements

### Planned Features
1. **Data Export**: PDF reports and CSV downloads
2. **Goal Setting**: Semester and yearly academic goals
3. **Study Time Tracking**: Integration with time management
4. **Collaboration**: Share progress with study groups
5. **Mobile App**: Native iOS/Android versions

### Technical Improvements
1. **Better State Management**: Implement Redux or similar
2. **Testing**: Unit and integration tests
3. **Performance**: Optimize database queries and caching
4. **Security**: Add user authentication and data encryption

### Code Architecture
```javascript
// Future modular structure
class GradeTracker {
    constructor() {
        this.modules = {
            dataManager: new DataManager(),
            uiManager: new UIManager(),
            analyticsEngine: new AnalyticsEngine(),
            reportGenerator: new ReportGenerator()
        };
    }
}

class DataManager {
    async loadCourses() { /* ... */ }
    async saveCourse(course) { /* ... */ }
    async calculateGPA() { /* ... */ }
}

class UIManager {
    renderDashboard(data) { /* ... */ }
    showNotification(message, type) { /* ... */ }
    handleUserInput(event) { /* ... */ }
}
```

## Conclusion

Building my first web application was incredibly educational. It taught me not just about coding, but about user experience, project management, and the importance of iterative development.

Key takeaways for other students:

1. **Start Simple**: Don't try to build everything at once
2. **User Feedback is Gold**: Get real users to test your app early
3. **Documentation Saves Time**: Write clear comments and README files
4. **Learn by Doing**: Theory is important, but hands-on practice is invaluable
5. **Embrace Mistakes**: Every bug teaches you something new

The project went from a simple idea to a functional web application that I actually use daily. It's not perfect, but it solves a real problem and taught me invaluable skills that I'm applying to new projects.

For fellow Computer Systems Engineering students, I encourage you to build something – anything! The combination of frontend, backend, and database work gives you a complete understanding of how web applications function, which complements our systems-level education perfectly.

---

*Want to see the code or try the app? Check out the [GitHub repository](https://github.com/Tech-Vexy) or connect with me on [LinkedIn](https://www.linkedin.com/in/veldrineevelia) and [Twitter](https://x.com/EVeldrine) to discuss web development and student projects!*
