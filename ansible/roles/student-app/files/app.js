const http = require('http');
const { URL } = require('url');
const {
    getAllStudents,
    getStudentById,
    getStudentsByGrade,
    getAverageAge,
    getGradeDistribution,
    addStudent,
    updateStudent,
    deleteStudent
} = require('./students');
const { testConnection } = require('./db');

// Helper function to parse request body
function parseBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            } catch (error) {
                reject(error);
            }
        });
        req.on('error', reject);
    });
}

// Create server
function createServer() {
    return http.createServer(async (req, res) => {
        // Set CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        // Handle preflight requests
        if (req.method === 'OPTIONS') {
            res.writeHead(200);
            res.end();
            return;
        }

        try {
            const url = new URL(req.url, `http://${req.headers.host}`);
            const pathname = url.pathname;

            // Home page with student table and CRUD form
            if (pathname === '/' && req.method === 'GET') {
                const students = await getAllStudents();
                const avgAge = await getAverageAge();
                const gradeDistribution = await getGradeDistribution();

                const html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Student Profiles - IaC Demo</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #71ea66ff 0%, #4b62a2ff 100%);
            min-height: 100vh;
            padding: 40px 20px;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        h1 {
            color: #667eea;
            text-align: center;
            margin-bottom: 10px;
            font-size: 2.5em;
        }
        .subtitle {
            text-align: center;
            color: #666;
            margin-bottom: 30px;
        }
        .stats {
            display: flex;
            gap: 20px;
            margin-bottom: 30px;
            flex-wrap: wrap;
        }
        .stat-card {
            flex: 1;
            min-width: 200px;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 10px;
            text-align: center;
        }
        .stat-value {
            font-size: 2em;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .stat-label {
            opacity: 0.9;
        }
        .crud-section {
            background: #f8f9ff;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 30px;
        }
        .crud-section h2 {
            color: #667eea;
            margin-bottom: 20px;
        }
        .form-group {
            margin-bottom: 15px;
        }
        .form-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: 600;
            color: #333;
        }
        .form-group input, .form-group select {
            width: 100%;
            padding: 10px;
            border: 2px solid #e1e5e9;
            border-radius: 5px;
            font-size: 16px;
        }
        .form-group input:focus, .form-group select:focus {
            outline: none;
            border-color: #667eea;
        }
        .form-row {
            display: flex;
            gap: 15px;
        }
        .form-row .form-group {
            flex: 1;
        }
        .btn {
            padding: 12px 25px;
            border: none;
            border-radius: 5px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        .btn-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .btn-danger {
            background: linear-gradient(135deg, #e66767 0%, #a27676 100%);
            color: white;
        }
        .btn-success {
            background: linear-gradient(135deg, #66ea66 0%, #76a276 100%);
            color: white;
        }
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }
        .student-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        .student-table thead {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .student-table th {
            padding: 15px;
            text-align: left;
            font-weight: 600;
        }
        .student-table td {
            padding: 15px;
            border-bottom: 1px solid #f0f0f0;
        }
        .student-table tr:hover {
            background-color: #f8f9ff;
        }
        .grade-badge {
            display: inline-block;
            padding: 5px 15px;
            border-radius: 20px;
            font-weight: bold;
            color: white;
        }
        .grade-A { background-color: #4caf50; }
        .grade-B { background-color: #2196f3; }
        .grade-C { background-color: #ff9800; }
        .actions {
            display: flex;
            gap: 5px;
        }
        .btn-small {
            padding: 5px 10px;
            font-size: 12px;
        }
        .version {
            text-align: center;
            color: #667eea;
            margin-top: 30px;
            font-weight: bold;
        }
        .db-badge {
            display: inline-block;
            background: #2ecc71;
            color: white;
            padding: 5px 15px;
            border-radius: 15px;
            font-size: 0.9em;
            margin-left: 10px;
        }
        .message {
            padding: 10px;
            border-radius: 5px;
            margin-bottom: 20px;
            text-align: center;
        }
        .message.success {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        .message.error {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
        .edit-form {
            background: #e8f4fd;
            padding: 20px;
            border-radius: 10px;
            margin: 10px 0;
            border: 2px solid #667eea;
        }
        .iac-badge {
            display: inline-block;
            background: #ff6b35;
            color: white;
            padding: 5px 15px;
            border-radius: 15px;
            font-size: 0.9em;
            margin-left: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎓 Student Profile System <span class="db-badge">🗄️ PostgreSQL</span> <span class="iac-badge">🚀 Terraform + Ansible</span></h1>
        <div class="subtitle">Infrastructure as Code Demo - Automated Deployment</div>
        
        <div class="stats">
            <div class="stat-card">
                <div class="stat-value">${students.length}</div>
                <div class="stat-label">Total Students</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${avgAge.toFixed(1)}</div>
                <div class="stat-label">Average Age</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${gradeDistribution['A'] || 0}</div>
                <div class="stat-label">Grade A Students</div>
            </div>
        </div>

        <div class="crud-section">
            <h2>➕ Add New Student</h2>
            <form id="addStudentForm">
                <div class="form-row">
                    <div class="form-group">
                        <label for="name">Full Name</label>
                        <input type="text" id="name" name="name" required placeholder="Enter student name">
                    </div>
                    <div class="form-group">
                        <label for="age">Age</label>
                        <input type="number" id="age" name="age" required min="16" max="30" placeholder="Age">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="grade">Grade</label>
                        <select id="grade" name="grade" required>
                            <option value="">Select Grade</option>
                            <option value="A">A</option>
                            <option value="B">B</option>
                            <option value="C">C</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" id="email" name="email" required placeholder="student@school.com">
                    </div>
                </div>
                <button type="submit" class="btn btn-primary">Add Student</button>
            </form>
        </div>

        <div id="message"></div>
        <div id="editFormContainer"></div>

        <table class="student-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Age</th>
                    <th>Grade</th>
                    <th>Email</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${students.map(student => `
                    <tr id="student-${student.id}">
                        <td>${student.id}</td>
                        <td>${student.name}</td>
                        <td>${student.age}</td>
                        <td><span class="grade-badge grade-${student.grade}">${student.grade}</span></td>
                        <td>${student.email}</td>
                        <td class="actions">
                            <button class="btn btn-primary btn-small" onclick="editStudent(${student.id}, '${student.name.replace(/'/g, "\\'")}', ${student.age}, '${student.grade}', '${student.email.replace(/'/g, "\\'")}')">Edit</button>
                            <button class="btn btn-danger btn-small" onclick="deleteStudent(${student.id})">Delete</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        <div class="version">Deployed via Terraform + Ansible | Full CRUD Operations 🚀</div>
    </div>

    <script>
        // Add Student Form Handler
        document.getElementById('addStudentForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const studentData = {
                name: formData.get('name'),
                age: parseInt(formData.get('age')),
                grade: formData.get('grade'),
                email: formData.get('email')
            };

            try {
                const response = await fetch('/api/students', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(studentData)
                });

                const result = await response.json();
                
                if (result.success) {
                    showMessage('Student added successfully!', 'success');
                    this.reset();
                    setTimeout(() => {
                        window.location.reload();
                    }, 1500);
                } else {
                    showMessage('Error: ' + result.error, 'error');
                }
            } catch (error) {
                showMessage('Error adding student: ' + error.message, 'error');
            }
        });

        // Delete Student Function
        async function deleteStudent(id) {
            if (confirm('Are you sure you want to delete this student?')) {
                try {
                    const response = await fetch('/api/students/' + id, {
                        method: 'DELETE'
                    });

                    const result = await response.json();
                    
                    if (result.success) {
                        showMessage('Student deleted successfully!', 'success');
                        setTimeout(() => {
                            window.location.reload();
                        }, 1500);
                    } else {
                        showMessage('Error: ' + result.error, 'error');
                    }
                } catch (error) {
                    showMessage('Error deleting student: ' + error.message, 'error');
                }
            }
        }

        // Edit Student Function
        function editStudent(id, currentName, currentAge, currentGrade, currentEmail) {
            // Create edit form
            const editForm = \`
                <div class="edit-form" id="edit-form-\${id}">
                    <h3>✏️ Edit Student #\${id}</h3>
                    <form onsubmit="updateStudent(\${id}); return false;">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="edit-name-\${id}">Name</label>
                                <input type="text" id="edit-name-\${id}" value="\${currentName}" required>
                            </div>
                            <div class="form-group">
                                <label for="edit-age-\${id}">Age</label>
                                <input type="number" id="edit-age-\${id}" value="\${currentAge}" min="16" max="30" required>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="edit-grade-\${id}">Grade</label>
                                <select id="edit-grade-\${id}" required>
                                    <option value="A" \${currentGrade === 'A' ? 'selected' : ''}>A</option>
                                    <option value="B" \${currentGrade === 'B' ? 'selected' : ''}>B</option>
                                    <option value="C" \${currentGrade === 'C' ? 'selected' : ''}>C</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="edit-email-\${id}">Email</label>
                                <input type="email" id="edit-email-\${id}" value="\${currentEmail}" required>
                            </div>
                        </div>
                        <div class="form-row">
                            <button type="submit" class="btn btn-success">Update Student</button>
                            <button type="button" class="btn btn-danger" onclick="cancelEdit(\${id})">Cancel</button>
                        </div>
                    </form>
                </div>
            \`;
            
            // Remove any existing edit forms
            document.getElementById('editFormContainer').innerHTML = editForm;
            
            // Scroll to the edit form
            document.getElementById('edit-form-' + id).scrollIntoView({ behavior: 'smooth' });
        }

        // Cancel Edit Function
        function cancelEdit(id) {
            document.getElementById('editFormContainer').innerHTML = '';
        }

        // Update Student Function
        async function updateStudent(id) {
            const name = document.getElementById('edit-name-' + id).value;
            const age = parseInt(document.getElementById('edit-age-' + id).value);
            const grade = document.getElementById('edit-grade-' + id).value;
            const email = document.getElementById('edit-email-' + id).value;

            if (!name || !age || !grade || !email) {
                showMessage('All fields are required!', 'error');
                return;
            }

            try {
                const response = await fetch('/api/students/' + id, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ name, age, grade, email })
                });

                const result = await response.json();
                
                if (result.success) {
                    showMessage('Student updated successfully!', 'success');
                    document.getElementById('editFormContainer').innerHTML = '';
                    setTimeout(() => {
                        window.location.reload();
                    }, 1500);
                } else {
                    showMessage('Error: ' + result.error, 'error');
                }
            } catch (error) {
                showMessage('Error updating student: ' + error.message, 'error');
            }
        }

        // Show Message Function
        function showMessage(text, type) {
            const messageDiv = document.getElementById('message');
            messageDiv.innerHTML = text;
            messageDiv.className = 'message ' + type;
            messageDiv.style.display = 'block';
            
            setTimeout(() => {
                messageDiv.style.display = 'none';
            }, 5000);
        }
    </script>
</body>
</html>`;
                
                res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end(html);
            }
            // API: Get all students
            else if (pathname === '/api/students' && req.method === 'GET') {
                const students = await getAllStudents();
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, data: students }));
            }
            // API: Get student by ID
            else if (pathname.match(/\/api\/students\/\d+/) && req.method === 'GET') {
                try {
                    const id = parseInt(pathname.split('/')[3]);
                    const student = await getStudentById(id);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true, data: student }));
                } catch (error) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: error.message }));
                }
            }
            // API: Get students by grade
            else if (pathname.match(/\/api\/students\/grade\/[A-F]/) && req.method === 'GET') {
                const grade = pathname.split('/')[4];
                const students = await getStudentsByGrade(grade);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, data: students }));
            }
            // API: Add new student
            else if (pathname === '/api/students' && req.method === 'POST') {
                try {
                    const body = await parseBody(req);
                    const { name, age, grade, email } = body;
                    
                    if (!name || !age || !grade || !email) {
                        throw new Error('All fields are required');
                    }

                    const student = await addStudent(name, age, grade, email);
                    res.writeHead(201, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true, data: student }));
                } catch (error) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: error.message }));
                }
            }
            // API: Update student
            else if (pathname.match(/\/api\/students\/\d+/) && req.method === 'PUT') {
                try {
                    const id = parseInt(pathname.split('/')[3]);
                    const body = await parseBody(req);
                    const { name, age, grade, email } = body;
                    
                    if (!name || !age || !grade || !email) {
                        throw new Error('All fields are required');
                    }

                    const student = await updateStudent(id, name, age, grade, email);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true, data: student }));
                } catch (error) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: error.message }));
                }
            }
            // API: Delete student
            else if (pathname.match(/\/api\/students\/\d+/) && req.method === 'DELETE') {
                try {
                    const id = parseInt(pathname.split('/')[3]);
                    const student = await deleteStudent(id);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true, data: student }));
                } catch (error) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: error.message }));
                }
            }
            // 404 Not found
            else {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('Page not found');
            }
        } catch (error) {
            console.error('Server error:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                success: false, 
                error: 'Internal server error',
                message: error.message 
            }));
        }
    });
}

const PORT = process.env.PORT || 3000;

// Only start server if this file is run directly
if (require.main === module) {
    const server = createServer();
    
    // Test database connection before starting server
    testConnection().then(success => {
        if (success) {
            server.listen(PORT, () => {
                console.log(`🚀 Student Profile app running on http://localhost:${PORT}`);
                console.log(`📚 API Endpoints:`);
                console.log(`   GET  /                       - Web Interface with CRUD`);
                console.log(`   GET  /api/students           - All students`);
                console.log(`   GET  /api/students/:id       - Student by ID`);
                console.log(`   GET  /api/students/grade/A   - Students by grade`);
                console.log(`   POST /api/students           - Add new student`);
                console.log(`   PUT  /api/students/:id       - Update student`);
                console.log(`   DELETE /api/students/:id     - Delete student`);
            });
        } else {
            console.error('❌ Failed to connect to database. Server not started.');
            process.exit(1);
        }
    });
}

// Export for testing
module.exports = { createServer };
