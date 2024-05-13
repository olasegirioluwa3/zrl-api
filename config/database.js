module.exports = sequelize;
const { Sequelize } = require('sequelize');
require('dotenv').config();
const ENV = process.env.NODE_ENV || 'development';
let sequelizeConfig;

switch (ENV) {
    case 'development':
        sequelizeConfig = {
            database: process.env.DATABASENAME,
            username: process.env.DATABASEUSER,
            password: process.env.DATABASEPASSWORD,
            host: process.env.DATABASEHOST || 'localhost',
            dialect: 'mysql',
            pool: {
                max: 5,
                min: 0,
                acquire: 30000,
                idle: 10000
            },
            logging: console.log
        };
        break;
    
        case 'test':
            sequelizeConfig = {
                dialect: 'sqlite',
                storage: './data/test-database.sqlite',
                pool: {
                    max: 5,
                    min: 0,
                    acquire: 30000,
                    idle: 10000
                },
                logging: console.log
            };
            break;
    
    case 'production':
          sequelizeConfig = {
            database: process.env.DATABASENAME,
            username: process.env.DATABASEUSER,
            password: process.env.DATABASEPASSWORD,
            host: process.env.DATABASEHOST || 'localhost',
            dialect: 'mysql',
            pool: {
                max: 5,
                min: 0,
                acquire: 30000,
                idle: 10000
            },
            logging: console.log
        };
        break;
    
    default:
        throw new Error(`Unknown execution environment: ${ENV}`);
}

const sequelize = new Sequelize(sequelizeConfig);

sequelize
    .authenticate()
    .then(() => {
        console.log('Connection to the database has been established successfully.');
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });

module.exports = sequelize;
