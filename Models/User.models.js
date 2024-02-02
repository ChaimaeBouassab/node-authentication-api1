const mongoose = require('mongoose')
const Schema = mongoose.Schema
//const bcrypt = require('bcrypt')

const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
    minLength: 6,
    maxLength: 50,
  },
    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
  
    
  },
  {
    statics: {
      async isEmailUsed(email) {
        return !!(await this.findOne({ email }));
      },
    },
  })

  const User = mongoose.model('user', UserSchema)
module.exports = User