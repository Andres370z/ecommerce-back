const Mysqli = require ('mysqli');

let conn = new Mysqli({
    host: 'localhost',
    post: 3306, //port, default 3306
    user: 'root', // username
    passwd: '', // password
    db: 'ecommerce'
})

let db = conn.emit(false, '');

module.exports = {
    database: db
}