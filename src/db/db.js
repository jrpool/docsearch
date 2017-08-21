const pgp = require('pg-promise')()
const connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/contacts_development'
const db = pgp(connectionString)

module.exports = db
