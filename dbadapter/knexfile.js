module.exports = {
  production: {
    client: 'mysql2',
    connection: {
      host: '127.0.0.1',
      user: 'root',
      password: 'manage',
      database: 'ac4y'
    },
      pool: {
      min: 2,
      max: 10
    }
  }
};