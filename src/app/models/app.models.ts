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
