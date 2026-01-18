import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { User, UserCreateRequest } from "../../../models/user.model";


@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private http: HttpClient) { }

  createUser(ownerUrl: string, userData: UserCreateRequest) {
    return this.http.post<User>(ownerUrl, userData, {
      withCredentials: true
    });
  }

  getUserById(userId: string) {
    return this.http.get<User>(`/api/users/${userId}`, {
      withCredentials: true
    });
  }
}
