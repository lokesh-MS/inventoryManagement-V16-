import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DbserviceService {
mainUrl:string ="https://localhost:7153/api/";
publishUrl:string="http://localhost:63/api/Product";
  constructor(private http:HttpClient) { }

  $getAllProducts(){
    return this.http.get(this.publishUrl);
  }
  $AddProduct(product:object){
return this.http.post(this.publishUrl,product);
  }
  getProducts(page: number, pageSize: number) {
    const apiUrl = `https://localhost:7153/api/Product/Paged?page=${page}&pageSize=${pageSize}`;
    return this.http.get(apiUrl);
  }
}
