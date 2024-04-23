import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DbserviceService } from 'src/app/services/dbservice.service';
import { HttpClient } from '@angular/common/http';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { TDocumentDefinitions } from 'pdfmake/interfaces';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  constructor(private FB: FormBuilder, private service: DbserviceService, private http: HttpClient) { }
  productGroup!: FormGroup;
  productArray: any[] = [];

  ngOnInit(): void {
    this.productGroup = this.FB.group({
      Product_Name: [''],
      price: [''],
      quantity: [''],
      amount: ['']
    });
    (pdfMake as any).vfs = pdfFonts.pdfMake.vfs;
    this.fetchStaffData();
  }

  existAmount: number = 0;
  currentAmount: number = 0;

  Add() {
    let productName = this.productGroup.value.Product_Name.toLowerCase();
    let quantityString = this.productGroup.value.quantity.toString();
    this.productGroup.value.quantity = quantityString;
    let amountString = this.productGroup.value.amount.toString();
    this.productGroup.value.amount = amountString;
    if (productName !== '' && productName !== null) {
      this.productArray.push(this.productGroup.value);
      this.InsertProduct();
      this.existAmount = this.existAmount + this.currentAmount;
      this.productGroup.reset();
      let productInputEle = document.getElementById("product") as HTMLInputElement;
      if (productInputEle) {
        productInputEle.focus();
      }
    }
    else {
      alert('Enter product!')
    }
  }

  AddRate() {
    let Quty = this.productGroup.value.quantity;
    let Price = this.productGroup.value.price;
    let Amount = Number(Price) * Number(Quty);
    this.currentAmount = Amount;
    this.productGroup.patchValue({
      amount: Amount,
    });
  }

  InsertProduct() {
    this.service.$AddProduct(this.productGroup.value).subscribe({
      next: (res) => {
        console.log(res);
      },
      error: (err) => {
        console.log(`product not inserted ${JSON.stringify(err)}`);
      }
    });
  }

  CompleteProcess() {
    this.productArray = [];
    this.existAmount = 0;
    this.productGroup.reset();
  }

  staff: any = [];
  displayedStaff: any[] = [];
  currentPage: number = 1;
  totalPages: number[] = [1]; // Initialize totalPages as an array with one element
  itemsPerPage: number = 10;
  searchQuery: any = '';
  searchNotFountStr: string = '';

  fetchStaffData() {
    const apiUrl = `https://localhost:7153/api/Product/Paged?page=${this.currentPage}&pageSize=${this.itemsPerPage}`;
    this.http.get(apiUrl).subscribe({
      next: (res: any) => {
        this.staff = res.products;
        this.staff.sort((a: any, b: any) => {
          // Implement sorting logic based on your requirements
          // For example, let's sort by product name alphabetically
          if (a.product_Name < b.product_Name) {
            return -1;
          } else if (a.product_Name > b.product_Name) {
            return 1;
          } else {
            return 0;
          }
        });
        this.totalPages = Array.from({ length: res.totalPages }, (_, i) => i + 1); // Initialize totalPages as an array of numbers from 1 to totalPages
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
    this.displayedStaff = this.staff;
  }

  search() {
    this.searchQuery = document.getElementById("searchItem") as HTMLInputElement;

    if (this.searchQuery.value !== '') {
      this.http.get(`https://localhost:7153/api/Product/Search/${this.searchQuery.value}`).subscribe({
        next: (res: any) => {
          console.log(res);
          if (res != null && res != undefined) {
            this.searchNotFountStr = '';
            this.staff = res;
            this.updateDisplayedStaff();
          }
        },
        error: (error) => {
          if (error.status === 404) {
            this.staff = [];
            console.log("No products found matching the search criteria!!!");
            this.searchNotFountStr = "No products found matching the search criteria!!!";
            // Handle not found error, display appropriate message to the user
          } else {
            console.error("An error occurred:", error);
            // Handle other errors
          }
        }
      });
    } else {
      this.fetchStaffData();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.fetchStaffData();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages.length) {
      this.currentPage++;
      this.fetchStaffData();
    }
  }

  generatePDF() {
    const documentDefinition: TDocumentDefinitions = {
      content: [
        { text: 'Invoice', style: 'header' },
        { text: 'Invoice Number: INV-001' },
        { text: 'Date: ' + new Date().toDateString() },
        { text: '\n' },
        {
          table: {
            headerRows: 1,
            widths: ['*', 'auto', 'auto', 'auto'],
            body: [
              ['Item Name', 'Price', 'Quantity', 'Amount'],
              ...this.productArray.map(item => [item.Product_Name, item.price, item.quantity, item.amount])
            ]
          }
        },
        { text: '\n' },
        { text: 'Total Amount: ' + this.getTotalAmount(), style: 'total' }
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true
        },
        total: {
          fontSize: 16,
          bold: true
        }
      }
    };

    pdfMake.createPdf(documentDefinition).open();
  }

  getTotalAmount(): number {
    // Ensure that each item's amount is parsed as a number before adding
    return this.productArray.reduce((total, item) => total + parseFloat(item.amount), 0);
  }
  
  viewStock() {
    this.fetchStaffData();
  }
  
  navigateToPage(page: number) {
    // Define the logic to navigate to a specific page
  }
}
