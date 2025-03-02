// Open or create the IndexedDB database
const dbName = 'StudentDB';
let db;

const request = indexedDB.open(dbName, 1);

// Create the object store and define schema if this is the first time creating the database
request.onupgradeneeded = (e) => {
    db = e.target.result;
    const objectStore = db.createObjectStore('students', { keyPath: 'id', autoIncrement: true });
    objectStore.createIndex('name', 'name', { unique: false });
    objectStore.createIndex('age', 'age', { unique: false });
    objectStore.createIndex('course', 'course', { unique: false });
};

// Handle database errors
request.onerror = (e) => {
    console.error('Database error:', e.target.error);
};

// Function to add student data to IndexedDB
function addStudent(student) {
    const transaction = db.transaction(['students'], 'readwrite');
    const objectStore = transaction.objectStore('students');
    objectStore.add(student);

    transaction.oncomplete = () => {
        console.log('Student added');
        displayStudents(); // Update the student list
    };

    transaction.onerror = (e) => {
        console.error('Transaction error:', e.target.error);
    };
}

// Function to delete a student from IndexedDB with confirmation
function deleteStudent(id) {
    const confirmation = window.confirm('Are you sure you want to delete this student?');

    if (confirmation) {
        const transaction = db.transaction(['students'], 'readwrite');
        const objectStore = transaction.objectStore('students');
        objectStore.delete(id);

        transaction.oncomplete = () => {
            console.log('Student deleted');
            displayStudents(); // Update the student list
        };

        transaction.onerror = (e) => {
            console.error('Transaction error:', e.target.error);
        };
    }
}

// Function to display all students with a delete button that shows on hover
function displayStudents() {
    const transaction = db.transaction(['students'], 'readonly');
    const objectStore = transaction.objectStore('students');
    const request = objectStore.getAll();

    request.onsuccess = () => {
        const students = request.result;
        const studentsListDiv = document.getElementById('studentsList');
        studentsListDiv.innerHTML = ''; // Clear current list
        students.forEach(student => {
            const studentDiv = document.createElement('div');
            studentDiv.classList.add('student-entry');

            // Student details container
            const studentDetailsDiv = document.createElement('div');
            studentDetailsDiv.classList.add('student-details');
            studentDetailsDiv.textContent = `Name: ${student.name}, Age: ${student.age}, Course: ${student.course}`;

            // Create a Delete button for each student
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.classList.add('delete-btn');
            deleteButton.onclick = () => deleteStudent(student.id); // Delete the student when clicked

            studentDiv.appendChild(studentDetailsDiv);
            studentDiv.appendChild(deleteButton);
            studentsListDiv.appendChild(studentDiv);
        });
    };
}

// Event listener for the student form submission
document.getElementById('studentForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const age = document.getElementById('age').value;
    const course = document.getElementById('course').value;

    const student = { name, age, course };
    addStudent(student); // Add student to IndexedDB
    document.getElementById('studentForm').reset(); // Reset the form
});

// Wait for the database to be opened before displaying students
request.onsuccess = () => {
    db = request.result;
    displayStudents();
};