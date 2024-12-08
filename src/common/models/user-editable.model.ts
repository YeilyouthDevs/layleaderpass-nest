import { Column, ForeignKey, BelongsTo, DataType, Model } from 'sequelize-typescript';
import { User } from 'src/user/user.model';

/**
 * createdBy, updatedBy 두 필드가 기본으로 정의된 Model클래스를 확장한 베이스 모델
 */
export abstract class UserEditableModel<T extends {}> extends Model<T> {
    @ForeignKey(() => User)
    @Column({ type: DataType.STRING, allowNull: true }) // VARCHAR로 설정
    createdBy: string;

    @BelongsTo(() => User, { foreignKey: 'createdBy', onDelete: 'SET NULL' })
    creator: User;

    @ForeignKey(() => User)
    @Column({ type: DataType.STRING, allowNull: true }) // VARCHAR로 설정
    updatedBy: string;

    @BelongsTo(() => User, { foreignKey: 'updatedBy', onDelete: 'SET NULL' })
    editor: User;
}
