const sqlite = require('sqlite');
const bcrypt = require('bcrypt');
const SQL = require('sql-template-strings');

const { env: { MONGO_PORT }} = process;

const SALT_WORK_FACTOR = 10;

const db = sqlite.open('database.sqlite');

class User {
  constructor(data) {
    const { username, password } = data;

    Object.assign(this, data);

    this.hashPassword();

    db.get(SQL`INSERT INTO Users (username, password, created_at) VALUES (${username}, ${password}, TIMESTAMP)`)
      .then((res) => {
        console.log('success res:', res);
      })
      .catch(err => {
        console.error( `Error saving user: ${e}`);
      });
  }

  static hashPassword() {
    return bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
      if (err) console.error('Error generating salt:', err);

      return bcrypt.hash(this.password, salt, (e, hash) => {
        if (e) return console.error('Error hashing password:', e);
        this.password = hash;
        return console.log('successfully saved user');
        });
    });
  }

  static findOne(username) {

  }

  static comparePassword(
      candidatePassword,
      cb
  ) {
    bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
      if (err) return cb(err);
      return cb(null, isMatch);
    });
  };
}

module.exports = { Users: User };
