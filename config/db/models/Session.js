module.exports = function(sequelize, DataTypes){
    return sequelize.define('Session', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        ip: { type: DataTypes.STRING(15), allowNull: false },
        refresh_token: { type: DataTypes.STRING(100), allowNull: false },
        
    }, {
        underscored: true,
        tableName: 'session',
    });
}