import {
  IsNotEmpty,
  IsString,
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsAvailablePassword(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isAvailablePassword',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (!value) {
            return false;
          }

          const regex =
            /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
          if (!regex.test(value)) {
            return false;
          }

          const obj = args.object as ChangePasswordDto;
          if (propertyName === 'newPassword' && value === obj.oldPassword) {
            return false;
          }

          return true;
        },
        defaultMessage(args: ValidationArguments) {
          const value = args.value;
          if (!value) {
            return '비밀번호를 입력해주세요.';
          }

          const regex =
            /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
          if (!regex.test(value)) {
            return '비밀번호는 8자 이상이어야 하며, 최소 하나의 알파벳, 숫자, 특수문자가 포함되어야 합니다.';
          }

          const obj = args.object as ChangePasswordDto;
          if (args.property === 'newPassword' && value === obj.oldPassword) {
            return '기존 비밀번호와 같은 비밀번호를 사용할 수 없습니다.';
          }

          return '유효하지 않은 비밀번호입니다.';
        },
      },
    });
  };
}

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  @IsAvailablePassword()
  oldPassword: string;

  @IsString()
  @IsNotEmpty()
  @IsAvailablePassword()
  newPassword: string;
}
