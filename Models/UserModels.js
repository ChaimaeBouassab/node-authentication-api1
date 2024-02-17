import { Schema as _Schema, model } from "mongoose";
const Schema = _Schema;

const UserSchema = new Schema(
  {
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
    level: {
      type: String,
      enum: ["advanced", "normal", "intermediate"],
      required: true,
    },
    github: { type: String, required: true },
    linkedin: { type: String, required: true },
    team: { type: String, required: true },
    year: {
      type: Number,
      default: new Date().getFullYear()
    },
  },
  {
    statics: {
      async isEmailUsed(email) {
        return !!(await this.findOne({ email }));
      },
    },
  }
);

const getMemberModel = (year) => {
  const collectionName = `Member${year}`;
  return model(collectionName, UserSchema);
};
const MemberModel = getMemberModel(new Date().getFullYear());

module.exports = MemberModel, getMemberModel;
