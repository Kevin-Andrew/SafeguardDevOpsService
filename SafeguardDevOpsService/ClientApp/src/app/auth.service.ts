import { HttpClient } from '@angular/common/http';
import { catchError, tap } from 'rxjs/operators';
import { Observable, throwError, of } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })

export class AuthService {

  constructor(
    private http: HttpClient,
    private window: Window) {
  }

  login(applianceAddress: string): void {
    const redirect = encodeURIComponent(location.protocol + '//' + location.host + '/main');
    this.window.location.href = 'https://' + applianceAddress + '/RSTS/Login?response_type=token&redirect_uri=' + redirect;
  }

  getUserToken(applianceAddress: string): Observable<any> {
    const userToken = this.window.sessionStorage.getItem('UserToken');

    if (!userToken) {
      const accessToken = this.window.sessionStorage.getItem('AccessToken');
      this.window.sessionStorage.removeItem('AccessToken');

      if (!accessToken) {
        this.login(applianceAddress);
        return of();
      }
      return this.getLoginResponse(applianceAddress, accessToken)
        .pipe(tap((data) => {
          if (data?.Status === 'Success') {
            this.window.sessionStorage.setItem('UserToken', data.UserToken);
          }
        }));
    } else {
      this.window.sessionStorage.removeItem('AccessToken');
      return of({ Status: 'Success', UserToken: userToken });
    }
  }

  private getLoginResponse(applianceAddress: string, accessToken: string): Observable<any> {
    const url = 'https://' + applianceAddress + '/service/core/v3/Token/LoginResponse';

    return this.http.post(url, { StsAccessToken: accessToken })
      .pipe(catchError(this.error('getSafeguard')));
  }

  private error<T>(method: string) {
    return (error): Observable<T> => {
      console.log(`[AuthService.${method}]: ${error.message}`);
      return throwError(error);
    };
  }
}
