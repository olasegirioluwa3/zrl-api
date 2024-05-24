const { Model, DataTypes } = require('sequelize');

class Message extends Model {
  static associate(models) {
  }
}

const initializeMessageModel = (sequelize) => {
  Message.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    chatId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    senderId: { // either contact or user
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    message: {
      type: DataTypes.TEXT,
      defaultValue: ''
    },
    messageType: {
      type: DataTypes.ENUM('Text', 'Image', 'Video', 'Audio', 'Docs', 'Other'),
      defaultValue: 'Text'
    },
    messageSender: {
      type: DataTypes.ENUM('Contact', 'Assistant', 'User'),
      defaultValue: 'Contact'
    },
    messageStatus: {
      type: DataTypes.ENUM('Sent', 'Received', 'Read'),
      defaultValue: 'Sent'
    },
    messageFiles: {
      type: DataTypes.TEXT,
      defaultValue: ''
    },
    messageDate: {
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
    modelName: 'message',
  });

  return Message;
};

module.exports = initializeMessageModel;