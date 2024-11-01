import { Column, DataType, Table, Model } from "sequelize-typescript";

@Table({
    freezeTableName: true
})
export class User extends Model<User> {

    // 이메일
    @Column({
        type: DataType.STRING,
        primaryKey: true
    })
    email: string;

    // 비밀번호
    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    password: string;
    
    // 이름
    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    name: string;

    // 생일
    @Column({
        type: DataType.DATEONLY,
        allowNull: false
    })
    birthday: Date;

    // 참가자인지를 나타냄. 작업시 참가자만 목록에 표시됨
    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: true
    })
    isParticipant: boolean;

}