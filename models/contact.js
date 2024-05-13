const { Model, DataTypes } = require('sequelize');

class Contact extends Model {
  static associate(models) {
  }
}

const initializeContactModel = (sequelize) => {
  Contact.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    platformUserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    platformUserGeneralId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    platformName: {
      type: DataTypes.ENUM('Whatsapp', 'Facebook', 'Twitter'),
      defaultValue: 'Whatsapp'
    },
    contactFirstName: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: ''
    },
    contactLastName: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: ''
    },
    contactMiddleName: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: ''
    },
    contactEmail: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: ''
    },
    contactStatus: {
      type: DataTypes.ENUM('Active', 'Inactive', 'Compromised'),
      defaultValue: 'Active'
    },
    joinDate: {
      type: DataTypes.DATE,
      defaultValue: new Date()
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE,
    },
    updatedAt: {
      allowNull: true,
      type: DataTypes.DATE,
    }
  },{
    sequelize,
    modelName: 'contact',
  });

  return Contact;
};

module.exports = initializeContactModel;