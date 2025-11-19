import { describe, it, expect } from '@jest/globals'
import { ApiResponse } from '@utils/response.utils.js'

describe('ApiResponse', () => {
  it('should create an instance', () => {
    expect(new ApiResponse({})).toBeTruthy()
  })

  it('should set pagination', () => {
    const response = new ApiResponse({})
    response.setPagination(100)

    expect(response.data.data.totalItems).toBe(100)
    expect(response.data.data.totalPage).toBe(10)
    expect(response.data.data.pageNum).toBe(1)
    expect(response.data.data.items).toBe(10)
  })
})
