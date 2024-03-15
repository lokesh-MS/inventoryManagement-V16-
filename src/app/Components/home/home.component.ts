import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DbserviceService } from 'src/app/services/dbservice.service';
import { HttpClient } from '@angular/common/http';
import * as pdfmake from 'pdfmake/build/pdfmake';


import jsPDF from 'jspdf'; // Note the default import
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit{
constructor(private FB:FormBuilder,private service:DbserviceService,private http: HttpClient){}
productGroup!:FormGroup;
productData:any;
productArray = new Array<any>();
ngOnInit(): void {
  this.productGroup = this.FB.group({
    Product_Name:[''],
    price:[''],
    quantity:[''],
    amount:['']
  })
 

  
}
existAmount:number=0;

currentAmount:number=0;
Add(){
  
  this.productGroup.value.Product_Name.toLowerCase();
  this.productGroup.value.quantity.toString();
  let quantityString = this.productGroup.value.quantity.toString();
  this.productGroup.value.quantity=quantityString;
  this.productGroup.value.amount.toString();
  let amountString = this.productGroup.value.amount.toString();
  this.productGroup.value.amount=amountString
 this.productData = this.productGroup.value;
 console.log(this.productData);
 this.productArray.push(this.productData);
 this.InsertProduct()

 this.existAmount =this.existAmount+this.currentAmount;
 console.log(`exist`,this.existAmount);
 this.productGroup.reset();
 console.log( document.getElementById("product"));
 let productInputEle = document.getElementById("product") as HTMLInputElement;
 if (productInputEle) {
     productInputEle.focus();
 }
}
AddRate(){

 let Quty =this.productGroup.value.quantity;
 let Price = this.productGroup.value.price;
 let Amount = Number(Price)*Number(Quty);

  this.currentAmount=Amount;
 console.log(Amount);
 this.productGroup.patchValue({
  amount: Amount,
});

}
InsertProduct(){
 this.service.$AddProduct(this.productData).subscribe({
  next:(res)=>{
console.log(res);

  },
  error:(err)=>{
    console.log(`product not inserted ${JSON.stringify(err)}`);
    
  }
 })
}
CompleteProcess(){
  this.productArray=[];
  this.existAmount=0;
  this.productGroup.reset();
}
viewStock(){
  this.fetchStaffData();
}

staff: any = []; // Array to hold all staff data
displayedStaff: any[] = []; // Array to hold staff data to be displayed
currentPage: number = 1; // Current page number
totalPages: number = 1; // Total number of pages
itemsPerPage: number = 10; // Number of items to display per page
searchQuery: string = ''; // Search query
 
reportData:any;
fetchStaffData() {
  
  const apiUrl = `https://localhost:7153/api/Product/Paged?page=${this.currentPage}&pageSize=${this.itemsPerPage}`;
  this.http.get(apiUrl).subscribe({
    next: (res: any) => {
      console.log(res);
      
      this.staff = res.products;
      this.reportData = res.products;
      this.totalPages = res.totalPages;
      if (this.staff) {
        this.updateDisplayedStaff();
      }
    },
    error: (err) => {
      console.log(`pagination error`, err);
    }
  });
}



updateDisplayedStaff() {
  
  const startIndex = (this.currentPage - 1) * this.itemsPerPage;
  const endIndex = startIndex + this.itemsPerPage;
  this.displayedStaff = this.staff.slice(startIndex, endIndex);
}

search() {
  debugger
  // Implement search logic here based on this.searchQuery
  // For example:
let searchQuery =document.getElementById("searchItem") as HTMLInputElement;
if (searchQuery) {
  this.displayedStaff = this.staff.filter((staff:any) => staff.product_Name.toLowerCase().includes(searchQuery.value.toLowerCase()));
  this.staff= this.displayedStaff
}
  
  this.currentPage = 1; // Reset current page to 1 after search
  this.updateDisplayedStaff();
}
previousPage() {
  
  if (this.currentPage > 1) {
    this.currentPage--;
    this.fetchStaffData();
  }
}

nextPage() {
  
  if (this.currentPage < this.totalPages) {
    this.currentPage++;
    this.fetchStaffData();
  }
}
data = [
  { name: 'John Doe', age: 30, city: 'New York' },
  { name: 'Jane Smith', age: 25, city: 'Los Angeles' },
  // Add more objects as needed
];

generatePDF() {
  const doc = new jsPDF();

  // Add heading
  doc.setFontSize(16);
  doc.setTextColor(255, 0, 0); // Red color
  doc.text('Lokesh PDF Report', 10, 10);

  // Add table header
  doc.setFontSize(12);
  doc.setTextColor(0); // Black color
  let y = 20; // Start position for the table header
  doc.text('product_Name', 10, y);
  doc.text('price', 60, y);
  doc.text('quantity', 100, y);
  doc.text('amount', 140, y);

  // Draw border for table header
  doc.rect(10, y - 5, 50, 10, 'S'); // product_Name
  doc.rect(60, y - 5, 30, 10, 'S'); // price
  doc.rect(100, y - 5, 30, 10, 'S'); // quantity
  doc.rect(140, y - 5, 30, 10, 'S'); // amount

  // Add table rows
  y += 10; // Move down for the content
  this.staff.forEach((item: any) => {
    doc.text(item.product_Name, 10, y);
    doc.text(String(item.price), 60, y);
    doc.text(String(item.quantity), 100, y);
    doc.text(String(item.amount), 140, y);

    // Draw border for table rows
    doc.rect(10, y - 5, 50, 10, 'S'); // product_Name
    doc.rect(60, y - 5, 30, 10, 'S'); // price
    doc.rect(100, y - 5, 30, 10, 'S'); // quantity
    doc.rect(140, y - 5, 30, 10, 'S'); // amount

    y += 10; // Move to the next row
  });

  // Save the document
  doc.save('document.pdf');
}


}








