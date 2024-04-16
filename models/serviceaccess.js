const { Model, DataTypes } = require('sequelize');

class ServiceAccess extends Model {
  static associate(models) {
    // this.belongsTo(models.application, { foreignKey: 'applicationId' });
  }

  isCompleted() {
    return this.paymentStatus === 'Completed';
  }

  notCompleted() {
    return this.paymentStatus === 'Failed';
  }

  isPending() {
    return this.paymentStatus === 'Pending';
  }
}

const initializeServiceAccessModel = (sequelize) => {
  ServiceAccess.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    svId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    svProductId: { // e.g whatsappId
      type: DataTypes.INTEGER,
      allowNull: false
    },
    amountPaid: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    paymentStatus: {
      type: DataTypes.ENUM('Pending', 'Completed', 'Failed'),
      defaultValue: 'Pending'
    },
    paymentReference: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: ''
    },
    paymentAuthorizer: { // auth code and some data from last payment.
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: ''
    },
    paymentDate: {
      type: DataTypes.DATE,
      defaultValue: new Date()
    },
    gateway: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [['Stripe', 'Paystack', 'Transfer'/*... other gateways ...*/]]
      }
    },
    currency: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [3, 3],  // ISO currency codes are 3 characters long
        isUppercase: true  // ISO currency codes are uppercase
      }
    },
    paymentNextDate: {
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
    modelName: 'serviceaccess',
  });

  return ServiceAccess;
};

module.exports = initializeServiceAccessModel;