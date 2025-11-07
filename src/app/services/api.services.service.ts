import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})


export class ApiService {

  private apiBase = '/api/testingreso';
  private candidateId = 'CAND_0016';
  public token: string | null = null;

  constructor(private http: HttpClient) {}


  private getHeaders(): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'X-CANDIDATE-ID': this.candidateId,
    });
    if (this.token) {
      headers = headers.set('Authorization', `Bearer ${this.token}`);
    }
    return headers;
  }


  login(email: string, password: string): Observable<any> {
    return this.http.post(
      `${this.apiBase}/auth/login`,
      { email, password },
      {
        headers: this.getHeaders(),
      }
    );
  }


  getContacts(
    page: number = 1,
    perPage: number = 10,
    search: string = ''
  ): Observable<any> {
    let url = `${this.apiBase}/contacts?page=${page}&per_page=${perPage}`;
    if (search) {
      url += `&q=${encodeURIComponent(search)}`;
    }
    return this.http.get(url, { headers: this.getHeaders() });
  }



  createContact(contact: any): Observable<any> {
    return this.http.post(`${this.apiBase}/contacts`, contact, {
      headers: this.getHeaders(),
    });
  }


  
  bulkCreateContacts(data: any): Observable<any> {
    return this.http.post(`${this.apiBase}/contacts/bulk`, data, {
      headers: this.getHeaders(),
    });
  }
}
