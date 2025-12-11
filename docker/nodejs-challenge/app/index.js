const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

const SQL_SCRIPTS = {
  PERSON: {
    CREATE_TABLE: `CREATE TABLE IF NOT EXISTS people (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255))`,
    INSERT: `INSERT INTO people(name) VALUES(?)`,
    SELECT_ALL: `SELECT * FROM people`,
    DELETE_ALL: `DELETE FROM people`
  }
}

async function start() {
  try {
    await pool.query(SQL_SCRIPTS.PERSON.CREATE_TABLE);
    console.log('Table created or already exists');

    await pool.query(SQL_SCRIPTS.PERSON.DELETE_ALL);
    console.log('Clearing existing data');

    await pool.query(SQL_SCRIPTS.PERSON.INSERT, ['Lucas']);
    console.log('Initial data inserted');
  } catch (err) {
    console.error('Error in start:', err);
  }
}

start();

app.get('/', async (req, res) => {
  try {
    const [results] = await pool.query(SQL_SCRIPTS.PERSON.SELECT_ALL);
    const peopleHtmlList = (people) => people.map(p => `<li>${p.id}: ${p.name}</li>`).join('');

    const html = `
      <h1>Full Cycle Rocks!</h1>
      <hr />
      <h4>People List</h4>
      <ul>
        ${peopleHtmlList(results)}
      </ul>
      <hr />
      <h4>Add New Person</h4>
      <form action="/add" method="post">
        <input type="text" name="name" placeholder="Enter name" required>
        <button type="submit">Add</button>
      </form>
    `;

    res.send(html);
  } catch (err) {
    res.status(500).send('Error fetching data');
  }
});

app.post('/add', async (req, res) => {
  const name = req.body.name;
  if (!name) {
    return res.status(400).send('Name is required');
  }
  try {
    await pool.query(SQL_SCRIPTS.PERSON.INSERT, [name]);
    res.redirect('/');
  } catch (err) {
    console.error('Error inserting:', err);
    res.status(500).send('Error adding person');
  }
});

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.send('OK');
  } catch (err) {
    res.status(500).send('DB not healthy');
  }
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
