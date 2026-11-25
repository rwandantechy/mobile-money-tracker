const mongoose = require('mongoose');

let connectionPromise;

function connectToDatabase() {
  if (mongoose.connection.readyState === 1) {
    return Promise.resolve(mongoose.connection);
  }

  if (!process.env.MONGODB_URI) {
    return Promise.reject(new Error('MONGODB_URI environment variable is required'));
  }

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(process.env.MONGODB_URI, {
      retryWrites: true,
      w: 'majority',
      dbName: 'mydata'
    }).catch(error => {
      connectionPromise = undefined;
      throw error;
    });
  }

  return connectionPromise;
}

module.exports = connectToDatabase;
