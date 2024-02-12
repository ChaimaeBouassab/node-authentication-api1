const mongoose = require('mongoose')


const mongoUri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME;

if (!mongoUri || !dbName) {
    console.error('MONGODB_URI or DB_NAME is not defined.');
    process.exit(1);
}
mongoose.connect(process.env.MONGODB_URI,{
    dbName:process.env.DB_NAME,
    useNewUrlParser:true,
    useUnifiedTopology:true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

mongoose.connection.on('connected',() => {
    console.log('MongoDB connection to db');
  })
  mongoose.connection.on('error',(err) => {
    console.log('MongoDB connection error',err);
  })
  mongoose.connection.on('disconnected',() => {
    console.log('MongoDB connection disconnected');
  })

  process.on('SIGINT', async () => {
     await mongoose.connection.close()
    process.exit(0)
  })
  
  module.exports = {mongoose}
  