const express = require('express')
const app = express()

const pg = require('pg')
const client = new pg.Client({
	connectionString: 'postgres://localhost:5432/acme_hr_db',
})
client.connect()

app.get('/api/employees', async (req, res) => {
	try {
		const { rows } = await client.query(
			'SELECT * FROM employees JOIN departments ON employees.department_id = departments.id ORDER BY employees.id'
		)
		res.status(200).json(rows)
	} catch (error) {
		res.status(500).json({ error: error.message })
	}
})
app.get('/api/employees/:id', async (req, res) => {
	try {
		const { rows } = await client.query(
			'SELECT * FROM employees WHERE id = $1',
			[req.params.id]
		)
		res.status(200).json(rows)
	} catch (error) {
		res.status(500).json({ error: error.message })
	}
})

app.get('/api/departments', async (req, res) => {
	try {
		const { rows } = await client.query('SELECT * FROM departments')
		res.status(200).json(rows)
	} catch (error) {
		res.status(500).json({ error: error.message })
	}
})
app.get('/api/departments/:id', async (req, res) => {
	try {
		const { rows } = await client.query(
			'SELECT * FROM departments WHERE id = $1',
			[req.params.id]
		)
		res.status(200).json(rows)
	} catch (error) {
		res.status(500).json({ error: error.message })
	}
})

app.post('/api/employees', async (req, res) => {
	try {
		const { rows } = await client.query(
			'INSERT INTO employees (name, department_id) VALUES ($1, $2) RETURNING *',
			[req.body.name, req.body.department_id]
		)
		res.status(201).json(rows)
	} catch (error) {
		res.status(500).json({ error: error.message })
	}
})
app.delete('/api/employees/:id', async (req, res) => {
	try {
		const { rows } = await client.query(
			'DELETE FROM employees WHERE id = $1 RETURNING *',
			[req.params.id]
		)
		res.status(200).json(rows)
	} catch (error) {
		res.status(500).json({ error: error.message })
	}
})
app.put('/api/employees/:id', async (req, res) => {
	try {
		const { rows } = await client.query(
			'UPDATE employees SET name = $1, department_id = $2 WHERE id = $3 RETURNING *',
			[req.body.name, req.body.department_id, req.params.id]
		)
		res.status(200).json(rows)
	} catch (error) {
		res.status(500).json({ error: error.message })
	}
})

const init = async () => {
	await client.query(`
    DROP TABLE IF EXISTS employees;
    DROP TABLE IF EXISTS departments;
    `)

	await client.query(`
    CREATE TABLE departments (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL
    )
    `)

	await client.query(`
    CREATE TABLE employees (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        department_id INTEGER REFERENCES departments(id) NOT NULL
    )
    `)

	await client.query(`
    INSERT INTO departments (name) VALUES ('HR');
    INSERT INTO departments (name) VALUES ('Engineering');
    INSERT INTO departments (name) VALUES ('Sales');
    INSERT INTO departments (name) VALUES ('Marketing');

    `)

	await client.query(`
    INSERT INTO employees (name, department_id) VALUES ('Alice', 1);
    INSERT INTO employees (name, department_id) VALUES ('Bob', 2);
    INSERT INTO employees (name, department_id) VALUES ('Charlie', 3);
    INSERT INTO employees (name, department_id) VALUES ('David', 4);
    `)
	console.log('Database has been initialized')

	app.listen(3000, () => {
		console.log('Server is running on port 3000')
	})
}

init()
