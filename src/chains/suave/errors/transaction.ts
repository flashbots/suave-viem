import { BaseError } from '../../../errors/base.js'

export type InvalidConfidentialRequestErrorType =
  InvalidConfidentialRequestError & {
    name: 'InvalidConfidentialRequestError'
  }
export class InvalidConfidentialRequestError extends BaseError {
  override name = 'InvalidConfidentialRequest'

  missingField: string

  constructor({ missingField }: { missingField: string; message?: string }) {
    super(`missing field: ${missingField}`)

    this.missingField = missingField
  }
}

export type InvalidConfidentialRecordErrorType =
  InvalidConfidentialRecordError & {
    name: 'InvalidConfidentialRecordError'
  }
export class InvalidConfidentialRecordError extends BaseError {
  override name = 'InvalidConfidentialRecord'

  missingField: string

  constructor({ missingField }: { missingField: string; message?: string }) {
    super(`missing field: ${missingField}`)

    this.missingField = missingField
  }
}
