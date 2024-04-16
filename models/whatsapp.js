const { Model, DataTypes } = require('sequelize');

class Whatsapp extends Model {
  static associate(models) {
  }

  isAccepted() {
    return this.status === 'Accepted';
  }

  isRejected() {
    return this.status === 'Rejected';
  }

  isProcessing() {
    return this.status === 'Processing';
  }

  isVerified() {
    return this.verifyStatus === 'Processing';
  }
}

const initializeWhatsappModel = (sequelize, DataTypes) => {
  Whatsapp.init({
    id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {  // Foreign key to User model
      type: DataTypes.BIGINT(15),
      allowNull: false,
      defaultValue: 0
    },
    svId:{
      type: DataTypes.BIGINT(15),
      allowNull: true,
      defaultValue: 0
    },
    whatsappNumber: {
      type: DataTypes.BIGINT(15),
      allowNull: true,
      defaultValue: 0
    },
    businessName: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: ''
    },
    businessDesc: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: ''
    },
    businessEmail: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: ''
    },
    whatsappNumberToken: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: ''
    },
    status: {
      type: DataTypes.ENUM('Pending', 'Accepted', 'Rejected', 'Processing'),
      defaultValue: 'Pending'
    },
    verifyToken: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: ''
    },
    verifyStatus: {
      type: DataTypes.ENUM('Pending', 'Accepted', 'Rejected', 'Processing'),
      defaultValue: 'Pending'
    },
    graphAPIToken: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: ''
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE,
    },
    updatedAt: {
      allowNull: true,
      type: DataTypes.DATE,
    }
  }, {
    sequelize,
    modelName: 'whatsapp',
  });

  return Whatsapp;
};

module.exports = initializeWhatsappModel;