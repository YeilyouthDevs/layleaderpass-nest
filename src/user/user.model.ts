import { Column, DataType, Table, Model } from "sequelize-typescript";
import { UserRole } from "src/enums/user-role.enum";

@Table({
    freezeTableName: true,
    updatedAt: false
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

    //전화번호
    @Column({
        type: DataType.STRING
    })
    phone: string;

    // 사용자 등급
    @Column({
        type: DataType.SMALLINT.UNSIGNED,
        allowNull: false,
        defaultValue: UserRole.GUEST
    })
    role: UserRole;
}