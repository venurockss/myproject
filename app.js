const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const mysql = require('mysql');
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
}));

// Database Connection
const db = mysql.createConnection({
    host: 'database-177.c36aiyu40djn.us-east-1.rds.amazonaws.com',
    user: 'admin',
    password: 'venu2006',
    database: 'student'
});

db.connect(err => {
    if (err) throw err;
    console.log('MySQL Connected...');
});

// Serve static files
app.use(express.static('views'));

// Routes
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/login.html');
});

// Login route
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    console.log(`Trying to login with username: ${username} and password: ${password}`); // Debug log

    const query = 'SELECT * FROM students WHERE username = ?';
    db.query(query, [username], (err, results) => {
        if (err) {
            console.error(err); // Log the error
            return res.status(500).send('Internal server error');
        }
        if (results.length > 0) {
            const user = results[0];
            // Compare password with the hashed password stored in the database
            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err) {
                    console.error(err); // Log the error
                    return res.status(500).send('Internal server error');
                }
                if (isMatch) {
                    req.session.user = username;
                    res.redirect('/dashboard');
                } else {
                    res.send('Invalid username or password');
                }
            });
        } else {
            res.send('Invalid username or password');
        }
    });
});

// Dashboard route
app.get('/dashboard', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/');
    }
    res.sendFile(__dirname + '/views/dashboard.html');
});

// Logout route
app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) throw err;
        res.redirect('/');
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
