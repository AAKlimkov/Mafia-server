const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const sqlite3 = require('sqlite3').verbose()
const path = require('path')
const fs = require('fs')

const app = express()
const PORT = 3001

// Убедимся, что папка для базы существует
const dataDir = path.resolve(__dirname, 'data')
if (!fs.existsSync(dataDir)) {
	fs.mkdirSync(dataDir)
}

// Путь к файлу базы данных внутри папки data
const dbPath = path.resolve(dataDir, 'data.db')

app.use(cors())
app.use(bodyParser.json())

// Подключение к базе
const db = new sqlite3.Database(dbPath, err => {
	if (err) {
		console.error('Ошибка подключения к БД:', err.message)
	} else {
		console.log('База данных подключена')

		// Создание таблицы и добавление моков
		db.run(
			`CREATE TABLE IF NOT EXISTS players (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        rating INTEGER NOT NULL
      )`,
			err => {
				if (err) {
					console.error('Ошибка при создании таблицы:', err.message)
					return
				}

				// Проверка, есть ли данные
				db.get('SELECT COUNT(*) as count FROM players', (err, row) => {
					if (err) {
						console.error('Ошибка при подсчёте игроков:', err.message)
						return
					}

					if (row && row.count === 0) {
						const mockPlayers = [
							['Alice', 1250],
							['Bob', 1180],
							['Charlie', 1300],
							['Diana', 12220],
							['Eve', 1280],
							['Frank', 1100],
							['Grace', 1275],
							['Heidi', 1195],
							['Ivan', 1210],
							['Judy', 1350],
						]

						const stmt = db.prepare(
							'INSERT INTO players (name, rating) VALUES (?, ?)'
						)
						mockPlayers.forEach(([name, rating]) => stmt.run(name, rating))
						stmt.finalize()

						console.log('В базу добавлены тестовые игроки')
					}
				})
			}
		)
	}
})

// API: получить всех игроков
app.get('/api/players', (req, res) => {
	db.all('SELECT * FROM players', [], (err, rows) => {
		if (err) {
			console.error('Ошибка при получении игроков:', err.message)
			res.status(500).json({ error: err.message })
		} else {
			res.json(rows)
		}
	})
})

// Запуск сервера
app.listen(PORT, () => {
	console.log(`Сервер запущен на http://localhost:${PORT}`)
})
