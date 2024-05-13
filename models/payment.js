const { Model, DataTypes } = require('sequelize');

class Payment extends Model {
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

const initializePaymentModel = (sequelize) => {
  Payment.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    saId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0
    },
    amountPaid: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    paymentStatus: {
      type: DataTypes.ENUM('Pending', 'Completed', 'Failed'),
      defaultValue: 'Pending'
    },
    paymentFullfilled: {
      type: DataTypes.ENUM('No', 'Yes', 'In-progress'),
      defaultValue: 'No'
    },
    paymentReference: {
      type: DataTypes.STRING,
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
    paymentDueDate: {
      type: DataTypes.DATE,
      defaultValue: new Date()
    },
    paymentNextDate: {
      type: DataTypes.DATE,
      defaultValue: new Date()
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
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
    modelName: 'payment',
  });

  return Payment;
};

module.exports = initializePaymentModel;