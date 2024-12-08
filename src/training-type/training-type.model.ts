import { Column, DataType, Table } from "sequelize-typescript";
import { UserEditableModel } from "src/common/models/user-editable.model";

@Table({
    freezeTableName: true,
})
export class TrainingType extends UserEditableModel<TrainingType> {

    @Column({
        type: DataType.INTEGER.UNSIGNED,
        primaryKey: true
    })
    id: number;

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    name: string;

    @Column({
        type: DataType.STRING,
    })
    desc: string;
}