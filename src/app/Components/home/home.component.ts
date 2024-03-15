import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DbserviceService } from 'src/app/services/dbservice.service';
import { HttpClient } from '@angular/common/http';
import * as pdfmake from 'pdfmake/build/pdfmake';


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
generatePDF() {
  this.createPDF() 
}




// createPDF() {
//   debugger

//   const documentDefinition = {
//     content: [
//       { text: 'Report', style: 'header' },
//       '\n',
//       {
//         table: {
//           headers: ['product_Name', 'price','quantity','amount'],
//           body: this.reportData.map((item:any) => [item.column1, item.column2,item.column3,item.column4])
//         }
//       }
//     ],
//     styles: {
//       header: {
//         fontSize: 18,
//         bold: true
//       }
//     }
//   };

//    pdfFonts.pdfMake = pdfMake; // Correcting assignment to pdfMake

//   const customVfs = {
//     Roboto: {
//       normal: 'Roboto-Medium.ttf'
//     }
//   };

//   pdfMake.createPdf(documentDefinition, {}, customVfs).download('report.pdf'); // Correcting customVfs format
// }
createPDF() {
  const documentDefinition = {
    content: [
      { text: 'Report', style: 'header' },
      '\n',
      {
        table: {
          headers: ['Product Name', 'Price', 'Quantity', 'Amount'],
          body: this.reportData.map((item: any) => [item.product_Name, item.price, item.quantity, item.amount])
        }
      }
    ],
    styles: {
      header: {
        fontSize: 18,
        bold: true
      }
    }
  };

  pdfmake.createPdf(documentDefinition).download('report.pdf');
}

}
