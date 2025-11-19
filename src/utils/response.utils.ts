// interface Data {
//   data: {
//     [key: string]: any
//   }
//   pagination?: Pagination
// }
interface Pagination {
  items: number
  pageNum: number
  totalItems: number
  totalPage: number
}

type DataResponse = {
  data: any
  pagination?: Pagination
}

export class ApiResponse {
  data: DataResponse
  // pagination: any
  constructor(data: any) {
    this.data = {
      ...data
    }
  }

  setPagination(totalItems: number, items = 10, pageNum = 1) {
    const totalPage = Math.floor(Math.ceil(totalItems / items))
    const pagination = {
      items,
      pageNum,
      totalItems,
      totalPage
    }

    this.data.data = pagination
  }
}
