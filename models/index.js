'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const { exec, spawn } = require('child_process');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  const connectionString = process.env[config.use_env_variable];
  if (connectionString) {
      sequelize = new Sequelize(connectionString);
  } else {
      console.error(`Environment variable ${config.use_env_variable} not set`);
      process.exit(1);
  }
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

// Function to export the database to a SQL file
// function exportDatabase() {
//   const timestamp = new Date().getTime();
//   const exportFileName = path.join(__dirname, `backup_${timestamp}.sql`);

//   const exportCommand = `mysql -u${process.env[config.username]} -p${process.env[config.password]} -h${process.env[config.host]} ${process.env[config.database]} < "${exportFileName}"`;

//   const childProcess = exec(exportCommand, { cwd: __dirname, shell: true }, (error, stdout, stderr) => {
//     if (error) {
//       console.error(`Error exporting database: ${error.message}`);
//       console.error(stderr);
//     } else {
//       console.log(`Database exported to ${exportFileName}`);
//     }
//   });

//   // Redirect child process output to the console
//   childProcess.stdout.pipe(process.stdout);
//   childProcess.stderr.pipe(process.stderr);
// }

// // Export the database before syncing
// exportDatabase();

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

// Sync the database with force: true to drop and recreate tables
  // sequelize.sync({ force: true })
  //   .then(() => {
  //     console.log('All tables have been dropped and re-synced.');
  //   })
  //   .catch(err => {
  //     console.error('Error dropping and re-syncing tables:', err);
  //   });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {     
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
