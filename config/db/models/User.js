module.exports = function(sequelize, DataTypes){
    return sequelize.define('User', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        name: { type: DataTypes.STRING(20), allowNull: false },
        email: { type: DataTypes.STRING(40), allowNull: false },
        password: { type: DataTypes.STRING(30), allowNull: false },
        status: { type: DataTypes.STRING(30), allowNull: false, default: 'RUN' },

    }, {
        underscored: true,
        tableName: 'user',
    });
}