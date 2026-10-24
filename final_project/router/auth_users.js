const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
    if (!username || typeof username !== "string") return false;
    let userswithsamename = users.filter((user) => user.username === username);
    return userswithsamename.length === 0;
};

const authenticatedUser = (username, password) => {
    let validusers = users.filter((user) => user.username === username && user.password === password);
    return validusers.length > 0;
};

// Only registered users can login
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    if (authenticatedUser(username, password)) {
        let accessToken = jwt.sign({
            username: username
        }, 'access', { expiresIn: 60 * 60 });

        req.session.authorization = {
            accessToken,
            username
        };
        return res.status(200).json({ message: "User successfully logged in", token: accessToken });
    } else {
        return res.status(401).json({ message: "Invalid login credentials" });
    }
});

// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review || req.body.review;
    const username = (req.session && req.session.authorization && req.session.authorization.username) || (req.user && req.user.username);

    if (!review) {
        return res.status(400).json({ message: "Review text is required" });
    }

    if (!username) {
        return res.status(403).json({ message: "User not identified" });
    }

    if (books[isbn]) {
        books[isbn].reviews[username] = review;
        return res.status(200).json({
            message: `The review for the book with ISBN ${isbn} has been added/updated`,
            reviews: books[isbn].reviews
        });
    } else {
        return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
    }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = (req.session && req.session.authorization && req.session.authorization.username) || (req.user && req.user.username);

    if (!username) {
        return res.status(403).json({ message: "User not identified" });
    }

    if (!books[isbn]) {
        return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
    }

    if (books[isbn].reviews && books[isbn].reviews[username]) {
        delete books[isbn].reviews[username];
        return res.status(200).json({ message: `Review for ISBN ${isbn} posted by the user ${username} deleted.` });
    } else {
        return res.status(404).json({ message: `Review by user ${username} for ISBN ${isbn} not found` });
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
