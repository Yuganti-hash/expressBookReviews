const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const axios = require('axios');
const public_users = express.Router();

// Helper functions using Promises for asynchronous retrieval (Tasks 10-13)
const getBookListPromise = () => {
    return new Promise((resolve, reject) => {
        if (books) {
            resolve(books);
        } else {
            reject({ status: 500, message: "Unable to retrieve book list" });
        }
    });
};

const getBookByISBNPromise = (isbn) => {
    return new Promise((resolve, reject) => {
        if (books[isbn]) {
            resolve(books[isbn]);
        } else {
            reject({ status: 404, message: `Book with ISBN ${isbn} not found` });
        }
    });
};

const getBooksByAuthorPromise = (author) => {
    return new Promise((resolve, reject) => {
        const matchingBooks = {};
        const keys = Object.keys(books);
        keys.forEach((key) => {
            if (books[key].author.toLowerCase() === author.toLowerCase()) {
                matchingBooks[key] = books[key];
            }
        });
        if (Object.keys(matchingBooks).length > 0) {
            resolve(matchingBooks);
        } else {
            reject({ status: 404, message: `No books found for author: ${author}` });
        }
    });
};

const getBooksByTitlePromise = (title) => {
    return new Promise((resolve, reject) => {
        const matchingBooks = {};
        const keys = Object.keys(books);
        keys.forEach((key) => {
            if (books[key].title.toLowerCase() === title.toLowerCase()) {
                matchingBooks[key] = books[key];
            }
        });
        if (Object.keys(matchingBooks).length > 0) {
            resolve(matchingBooks);
        } else {
            reject({ status: 404, message: `No books found with title: ${title}` });
        }
    });
};

// Task 6: Register a new user
public_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    if (!isValid(username)) {
        return res.status(409).json({ message: "Username already exists!" });
    }

    users.push({ username: username, password: password });
    return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

// Task 1 & Task 10: Get the book list available in the shop using async/await with Promise
public_users.get('/', async function (req, res) {
    try {
        const bookList = await getBookListPromise();
        return res.status(200).send(JSON.stringify(bookList, null, 4));
    } catch (error) {
        return res.status(error.status || 500).json({ message: error.message });
    }
});

// Task 2 & Task 11: Get book details based on ISBN using Promise callbacks
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    getBookByISBNPromise(isbn)
        .then((book) => {
            return res.status(200).send(JSON.stringify(book, null, 4));
        })
        .catch((error) => {
            return res.status(error.status || 500).json({ message: error.message });
        });
});

// Task 3 & Task 12: Get book details based on author using async/await with Promise
public_users.get('/author/:author', async function (req, res) {
    const author = req.params.author;
    try {
        const matchingBooks = await getBooksByAuthorPromise(author);
        return res.status(200).send(JSON.stringify(matchingBooks, null, 4));
    } catch (error) {
        return res.status(error.status || 500).json({ message: error.message });
    }
});

// Task 4 & Task 13: Get all books based on title using async/await with Promise
public_users.get('/title/:title', async function (req, res) {
    const title = req.params.title;
    try {
        const matchingBooks = await getBooksByTitlePromise(title);
        return res.status(200).send(JSON.stringify(matchingBooks, null, 4));
    } catch (error) {
        return res.status(error.status || 500).json({ message: error.message });
    }
});

// Task 5: Get book review based on ISBN
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    if (books[isbn]) {
        return res.status(200).send(JSON.stringify(books[isbn].reviews, null, 4));
    } else {
        return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
    }
});

module.exports.general = public_users;
module.exports.getBookListPromise = getBookListPromise;
module.exports.getBookByISBNPromise = getBookByISBNPromise;
module.exports.getBooksByAuthorPromise = getBooksByAuthorPromise;
module.exports.getBooksByTitlePromise = getBooksByTitlePromise;
