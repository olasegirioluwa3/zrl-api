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
      allowNull: false,
      defaultValue: 0
    },
    status: {
      type: DataTypes.ENUM('Init','Pending', 'Active', 'Failed'),
      defaultValue: 'Init'
    },
    paymentDate: {
      type: DataTypes.DATE,
      defaultValue: new Date()
    },
    paymentNextDate: {
      type: DataTypes.DATE,
      defaultValue: new Date()
    }, // #3134801011, musa babatunde, 134,000
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