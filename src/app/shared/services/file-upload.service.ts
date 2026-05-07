import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { UploadImageRequest, UploadImageResponse } from "../../models/product.model";


@Injectable({
  providedIn: 'root'
})
export class FileUploadService {

  constructor(private http: HttpClient) {
  }

  uploadProductImages(body: { files: UploadImageRequest[] }) {
    return this.http.post<UploadImageResponse[]>(`/api/image/upload`, body, {
      withCredentials: true,
    });
  }

  uploadImagesToS3WithFetch(url: string, file: File) {
    return fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
      },
      body: file,
    });
  }
}
