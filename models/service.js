const { Model, DataTypes } = require('sequelize');

class ServiceType extends Model {
  // Define associations for Application.
  static associate(models) {
  }

  isAccepted() {
    return this.applicationStatus === 'Pending';
  }

  isRejected() {
    return this.applicationStatus === 'Removed';
  }

  isProcessing() {
    return this.applicationStatus === 'Active';
  }
}

const initializeServiceTypeModel = (sequelize, DataTypes) => {
  ServiceType.init({
    svId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    svCode: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [2, 15],
        isLowercase: true  // ISO currency codes are uppercase
      },
      unique: true
    },
    svGroupCode: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [2, 15],
        isLowercase: true  // ISO currency codes are uppercase
      }
    },
    svName: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: ''
    },
    svDesc: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: ''
    },
    svSlug: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    svPaymentAmount: { // monthly and year
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "10000"
    },
    svPaymentDefaultCurrency: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'NGN'
    },
    svPaymentFrequency: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'MONTHLY'
    },
    svStatus: {
      type: DataTypes.ENUM('Pending', 'Removed', 'Active'),
      defaultValue: 'Pending'
    },
    svPaymentLevel: {
      type: DataTypes.ENUM('Basic', 'Professional', 'Business'),
      defaultValue: 'Basic'
    },
    svFeatures: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: "Ai-autoreply, conversation monitoring"
    },
    svPlanCode: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "paystackPlanCode,stripePlanCode"
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
    modelName: 'service',
  });

  return ServiceType;
};

module.exports = initializeServiceTypeModel;