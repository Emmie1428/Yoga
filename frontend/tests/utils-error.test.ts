import { describe, it, expect } from 'vitest';
import { getApiErrorMessage, isRequestCanceled } from '../src/utils/error'
import { AxiosError, AxiosHeaders, CanceledError } from 'axios';

describe('isRequestCanceled', () => {
    it('should return true when the request is canceled', () => {
        const axiosRequest = new CanceledError()

        const result = isRequestCanceled(axiosRequest)
        
        expect(result).toBe(true)
    })

    it('should return false when the request is not canceled', () => {
        const error = new Error('Something went wrong');

        const result = isRequestCanceled(error);

        expect(result).toBe(false);

    })
})


describe('getApiErrorMessage', () => {
  it('should return a generic error message for a non-Axios error', () => {
    const error = new Error('Something went wrong')

    const result = getApiErrorMessage(error)

    expect(result).toBe('An error occurred')
  });
  it('should return a specific error message for an Axios error with status 409', () => {
    const axiosError = new AxiosError('Error with Axios')
    axiosError.response = {
        data: {},
        status: 409,
        statusText: 'Conflict',
        headers: {},
        config: {
            headers: new AxiosHeaders()
        }
    }

    const result = getApiErrorMessage(axiosError)

    expect(result).toBe('Unable to create account. Please check your information.')
  })

  it('should return the API error message for an Axios error other than 409', () => {
    const axiosError = new AxiosError('Error with Axios')
    axiosError.response = {
        data: {
            message: 'Invalid email address'
        },
        status: 400,
        statusText: 'Bad Request',
        headers: {},
        config: {
            headers: new AxiosHeaders()
        }
    }

    const result = getApiErrorMessage(axiosError)

    expect(result).toBe('Invalid email address')
  })
  it('should return a generic message when the Axios error has no message', () => {
    const axiosError = new AxiosError('Error with Axios')
    axiosError.response = {
        data: {},
        status: 500,
        statusText: 'Internal Server Error',
        headers: {},
        config: {
            headers: new AxiosHeaders()
        }
    }

    const result = getApiErrorMessage(axiosError)

    expect(result).toBe('An error occurred')
  })
});