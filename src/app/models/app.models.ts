export interface BaseListResponse {
  currentPage: number
  pageSize: number
  total: number
}
export interface TableColumn {
  field: string;
  header: string;
  customExportHeader?: string;
}
export type SelectType = {
  code: string,
  name: string,
  child: SelectType[]
}

export enum LOCALE_STORAGE_KEYS {
  TOKEN = 'my_billing_access_token',
  USER = 'my_billing_current_user',
}
