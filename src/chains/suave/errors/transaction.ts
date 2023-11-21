import { BaseError } from '../../../errors/base.js'

export type MissingFieldErrorType = MissingFieldError & {
  name: 'MissingFieldError'
}
export class MissingFieldError extends BaseError {
  override name = 'MissingField'

  missingField: string
  found: any

  constructor({
    missingField,
    found,
  }: { missingField: string; found?: any; message?: string }) {
    super(`missing field: '${missingField}'${found ? `. found ${found}` : ''}`)

    this.missingField = missingField
  }
}

export class InvalidConfidentialRequestError extends MissingFieldError {
  override name = 'InvalidConfidentialRequest'
}

export class InvalidConfidentialRecordError extends MissingFieldError {
  override name = 'InvalidConfidentialRecord'
}
