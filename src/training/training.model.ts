import { Table, Column, DataType } from "sequelize-typescript";
import { UserEditableModel } from "src/common/models/user-editable.model";

@Table({
    freezeTableName: true,
})
export class Training extends UserEditableModel<Training> {
    
    @Column({
        type: DataType.INTEGER.UNSIGNED,
        primaryKey: true
    })
    id: number;

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    title: string;

    @Column({
        type: DataType.TEXT
    })
    content: string;

    @Column({
        type: DataType.DATE
    })
    startAt: Date;
    
    @Column({
        type: DataType.DATE
    })
    endAt: Date;

    @Column({
        type: DataType.DATE
    })
    submitStartAt: Date;

    @Column({
        type: DataType.DATE
    })
    submitEndAt: Date;
}