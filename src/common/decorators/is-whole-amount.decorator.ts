import { registerDecorator, ValidationOptions } from 'class-validator';
import { CURRENCY_DECIMALS, DEFAULT_CURRENCY } from '../constants/money.constants.js';

export function IsWholeAmount(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isWholeAmount',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown): boolean {
          if (typeof value !== 'number' || !Number.isFinite(value)) return true;
          const decimals = CURRENCY_DECIMALS[DEFAULT_CURRENCY];
          return Number(value.toFixed(decimals)) === value;
        },
        defaultMessage(): string {
          const decimals = CURRENCY_DECIMALS[DEFAULT_CURRENCY];
          return decimals === 0
            ? `$property must be a whole ${DEFAULT_CURRENCY} amount (no decimals)`
            : `$property must not have more than ${decimals} decimal place(s)`;
        },
      },
    });
  };
}
