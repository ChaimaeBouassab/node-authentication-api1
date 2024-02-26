import { Schema as _Schema, model } from "mongoose";
const Schema = _Schema;

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
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
      default: () => new Date().getFullYear(), 
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
// Define a function to get the MemberModel based on the year
const getMemberModel = (year) => {
  // Construct the collection name based on the year
  const collectionName = `Member${year}`;
  // Return the model using the collection name and the UserSchema
  return model(collectionName, UserSchema);
};
const MemberModel = getMemberModel(new Date().getFullYear());

export {getMemberModel, MemberModel}
