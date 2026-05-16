export interface BaseListResponse<T> {
  currentPage: number
  pageSize: number
  total: number
  data: T[]
}
export interface TableColumn {
  field: string;
  header: string;
  customExportHeader?: string;
}
export type SelectType = {
  id: string,
  name: string,
  label?: string
  children?: SelectType[]
}

export type MultiSelectType = {
  key: string,
  label: string,
  children?: MultiSelectType[]
}

export enum LOCALE_STORAGE_KEYS {
  TOKEN = 'my_billing_access_token',
  USER = 'my_billing_current_user',
}
