// =====================================================
// SIRC RESEARCH COPILOT
// CALIBRE DATABASE CONNECTION
// =====================================================

const sqlite3 = require("sqlite3").verbose();


// =====================================================
// CALIBRE DATABASE PATH
// =====================================================

const DB_PATH =
  "C:\\Users\\fizza\\Desktop\\SIRC Research Repository\\metadata.db";


// =====================================================
// OPEN CALIBRE DATABASE
// =====================================================

function openDatabase() {

  return new Promise((resolve, reject) => {

    const db = new sqlite3.Database(
      DB_PATH,
      sqlite3.OPEN_READONLY,
      (error) => {

        if (error) {
          reject(error);
          return;
        }

        resolve(db);

      }
    );

  });

}


// =====================================================
// GET ALL CALIBRE BOOKS
// =====================================================

async function getAllCalibreBooks() {

  const db = await openDatabase();

  return new Promise((resolve, reject) => {

    const query = `

      SELECT

        books.id,
        books.title,

        GROUP_CONCAT(
          DISTINCT authors.name
        ) AS authors,

        publishers.name AS publisher,

        books.pubdate,

        books.path

      FROM books

      LEFT JOIN books_authors_link
        ON books.id = books_authors_link.book

      LEFT JOIN authors
        ON authors.id = books_authors_link.author

      LEFT JOIN books_publishers_link
        ON books.id = books_publishers_link.book

      LEFT JOIN publishers
        ON publishers.id = books_publishers_link.publisher

      GROUP BY books.id

      ORDER BY books.title ASC

    `;

    db.all(
      query,
      [],
      (error, rows) => {

        db.close();

        if (error) {
          reject(error);
          return;
        }

        resolve(rows || []);

      }
    );

  });

}


// =====================================================
// SEARCH CALIBRE BOOKS
// =====================================================

async function searchCalibreBooks(query) {

  const db = await openDatabase();

  return new Promise((resolve, reject) => {

    const searchQuery = `

      SELECT

        books.id,
        books.title,

        GROUP_CONCAT(
          DISTINCT authors.name
        ) AS authors,

        publishers.name AS publisher,

        books.pubdate,

        books.path

      FROM books

      LEFT JOIN books_authors_link
        ON books.id = books_authors_link.book

      LEFT JOIN authors
        ON authors.id = books_authors_link.author

      LEFT JOIN books_publishers_link
        ON books.id = books_publishers_link.book

      LEFT JOIN publishers
        ON publishers.id = books_publishers_link.publisher

      WHERE

        books.title LIKE ?

        OR authors.name LIKE ?

        OR publishers.name LIKE ?

      GROUP BY books.id

      ORDER BY books.title ASC

      LIMIT 50

    `;

    const searchTerm =
      `%${query}%`;

    db.all(

      searchQuery,

      [
        searchTerm,
        searchTerm,
        searchTerm
      ],

      (error, rows) => {

        db.close();

        if (error) {
          reject(error);
          return;
        }

        resolve(rows || []);

      }

    );

  });

}


// =====================================================
// EXPORT
// =====================================================

module.exports = {

  searchCalibreBooks,

  getAllCalibreBooks,

  DB_PATH

};