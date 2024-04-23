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
    // (pdfMake as any).fonts = {
    //   Roboto: {
    //     normal: 'assets/fonts/Roboto-Regular.ttf',
    //     bold: 'assets/fonts/Roboto-Medium.ttf',
    //     italics: 'assets/fonts/Roboto-Italic.ttf',
    //     bolditalics: 'assets/fonts/Roboto-MediumItalic.ttf'
    //   }
    // };

    (pdfMake as any).vfs = pdfFonts.pdfMake.vfs;
  }

  existAmount: number = 0;
  currentAmount: number = 0;

  Add() {
    this.productGroup.value.Product_Name.toLowerCase();
    let quantityString = this.productGroup.value.quantity.toString();
    this.productGroup.value.quantity = quantityString;
    let amountString = this.productGroup.value.amount.toString();
    this.productGroup.value.amount = amountString;
    this.productArray.push(this.productGroup.value);
    this.InsertProduct();
    this.existAmount = this.existAmount + this.currentAmount;
    this.productGroup.reset();
    let productInputEle = document.getElementById("product") as HTMLInputElement;
    if (productInputEle) {
      productInputEle.focus();
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

  viewStock() {
    this.fetchStaffData();
  }

  staff: any = [];
  displayedStaff: any[] = [];
  currentPage: number = 1;
  totalPages: number = 1;
  itemsPerPage: number = 10;
  searchQuery: string = '';
  reportData: any;

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
    let searchQuery = document.getElementById("searchItem") as HTMLInputElement;
    if (searchQuery) {
      this.displayedStaff = this.staff.filter((staff: any) => staff.product_Name.toLowerCase().includes(searchQuery.value.toLowerCase()));
      this.staff = this.displayedStaff;
    }
    this.currentPage = 1;
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
}
