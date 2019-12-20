const mysql = require('serverless-mysql')

const db = mysql({
  config: {
    host: process.env.MYSQL_HOST,
    database: process.env.MYSQL_MOVIE_DATABASE,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD
  },
  onConnectError: (e) => { console.error('MySQL Connection Error: ' + e.code) },
  onError: (e) => { console.error('MySQL Error: ' + e.code) }
})

exports.query = async query => {
  try {
    const results = await db.query(query)
    await db.end()
    return results
  } catch (error) {
    return { error }
  }
}
