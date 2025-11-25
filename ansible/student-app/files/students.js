const { query } = require('./db');

// Email validation function
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validate all student emails
async function validateAllEmails() {
    try {
        const result = await query('SELECT id, name, email FROM students');
        const invalidStudents = [];
        
        result.rows.forEach(student => {
            if (!isValidEmail(student.email)) {
                invalidStudents.push({
                    id: student.id,
                    name: student.name,
                    email: student.email
                });
            }
        });
        
        return invalidStudents;
    } catch (error) {
        console.error('Error validating emails:', error);
        throw error;
    }
}

// Get all students
async function getAllStudents() {
    try {
        const result = await query('SELECT * FROM students ORDER BY id');
        return result.rows;
    } catch (error) {
        console.error('Error getting all students:', error);
        throw error;
    }
}

// Get student by ID
async function getStudentById(id) {
    try {
        const result = await query('SELECT * FROM students WHERE id = $1', [id]);
        
        if (result.rows.length === 0) {
            throw new Error('Student not found');
        }
        
        return result.rows[0];
    } catch (error) {
        console.error('Error getting student by ID:', error);
        throw error;
    }
}

// Get students by grade
async function getStudentsByGrade(grade) {
    try {
        const result = await query(
            'SELECT * FROM students WHERE grade = $1 ORDER BY id',
            [grade]
        );
        return result.rows;
    } catch (error) {
        console.error('Error getting students by grade:', error);
        throw error;
    }
}

// Calculate average age
async function getAverageAge() {
    try {
        const result = await query('SELECT AVG(age) as average_age FROM students');
        return parseFloat(result.rows[0].average_age) || 0;
    } catch (error) {
        console.error('Error calculating average age:', error);
        throw error;
    }
}

// Get grade distribution
async function getGradeDistribution() {
    try {
        const result = await query(
            'SELECT grade, COUNT(*) as count FROM students GROUP BY grade ORDER BY grade'
        );
        
        const distribution = {};
        result.rows.forEach(row => {
            distribution[row.grade] = parseInt(row.count);
        });
        
        return distribution;
    } catch (error) {
        console.error('Error getting grade distribution:', error);
        throw error;
    }
}

// Add a new student with validation
async function addStudent(name, age, grade, email) {
    // Validate email before adding
    if (!isValidEmail(email)) {
        throw new Error('Invalid email address');
    }
    
    try {
        const result = await query(
            'INSERT INTO students (name, age, grade, email) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, age, grade, email]
        );
        
        return result.rows[0];
    } catch (error) {
        console.error('Error adding student:', error);
        throw error;
    }
}

// Update a student
async function updateStudent(id, name, age, grade, email) {
    if (email && !isValidEmail(email)) {
        throw new Error('Invalid email address');
    }
    
    try {
        const result = await query(
            'UPDATE students SET name = $1, age = $2, grade = $3, email = $4 WHERE id = $5 RETURNING *',
            [name, age, grade, email, id]
        );
        
        if (result.rows.length === 0) {
            throw new Error('Student not found');
        }
        
        return result.rows[0];
    } catch (error) {
        console.error('Error updating student:', error);
        throw error;
    }
}

// Delete a student
async function deleteStudent(id) {
    try {
        const result = await query('DELETE FROM students WHERE id = $1 RETURNING *', [id]);
        
        if (result.rows.length === 0) {
            throw new Error('Student not found');
        }
        
        return result.rows[0];
    } catch (error) {
        console.error('Error deleting student:', error);
        throw error;
    }
}

module.exports = {
    getAllStudents,
    getStudentById,
    getStudentsByGrade,
    getAverageAge,
    getGradeDistribution,
    addStudent,
    updateStudent,
    deleteStudent,
    isValidEmail,
    validateAllEmails
};

