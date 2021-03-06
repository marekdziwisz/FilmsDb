import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { FilmsService } from 'src/app/+films/shared/films.service';
import { SorterService } from 'src/app/+films/shared/sorter.service';

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import {
  LoginData,
  LoginResponse,
  UserData
} from '../login/models/login.models';
import { AutoUnsubscribe } from '../shared/autoUnsubscribe.adapter';

@Injectable({
  providedIn: 'root'
})
export class AuthService extends AutoUnsubscribe {
  private baseUrl = 'https://marblejs-example.herokuapp.com/api/v1/';
  private loginUrl = `${this.baseUrl}auth/login`;
  private userDataUrl = `${this.baseUrl}users/me`;

  constructor(
    private http: HttpClient,
    private router: Router,
    private sorter: SorterService,
    private filmService: FilmsService
  ) {
    super();
  }

  private isLogged$ = new BehaviorSubject<boolean>(false);
  private sendingData$ = new BehaviorSubject<boolean>(false);
  private error$ = new BehaviorSubject<string>('');
  private userData$ = new BehaviorSubject<UserData>(null);

  login(loginData: LoginData) {
    this.sendingData$.next(true);
    this.subs.sink = this.http
      .post(this.loginUrl, JSON.stringify(loginData))
      .subscribe(
        (res: LoginResponse) => {
          window.sessionStorage.setItem('token', res.token);
          this.setInitialSettings();
          this.fetchUserData();
          this.error$.next('');
        },
        err => {
          catchError(this.handleError(err));
          this.sendingData$.next(false);
        }
      );
  }

  fetchUserData() {
    this.subs.sink = this.http.get(this.userDataUrl).subscribe(
      (res: UserData) => {
        window.sessionStorage.setItem('userData', JSON.stringify(res));
        this.userData$.next(res);
      },
      err => {
        throwError(err);
        this.sendingData$.next(false);
      },
      () => {
        this.router.navigate(['films', 1]);
        this.sendingData$.next(false);
        this.isLogged$.next(true);
      }
    );
  }

  setInitialSettings() {
    this.sorter.setSorting('title');
    this.filmService.setLimit(5);
  }

  getUserData(): Observable<UserData> {
    this.userData$.next(JSON.parse(window.sessionStorage.getItem('userData')));
    return this.userData$.asObservable();
  }

  handleError(err) {
    this.error$.next(err.statusText);
    return err;
  }

  getError() {
    return this.error$.asObservable();
  }

  getIsSending() {
    return this.sendingData$.asObservable();
  }

  logout() {
    window.sessionStorage.clear();
    this.router.navigate(['login']);
    this.isLogged$.next(false);
  }

  isLoggedIn() {
    this.isLogged$.next(!!this.getToken());
    return this.isLogged$.asObservable();
  }

  getToken() {
    return window.sessionStorage.getItem('token');
  }
}
