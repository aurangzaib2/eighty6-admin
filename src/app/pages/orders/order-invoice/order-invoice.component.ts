import { Component, Input, OnInit } from '@angular/core';
import { HttpResponse } from "@angular/common/http";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { OrdersService } from '../../../core/services/orders.service';
import { PdfMakeService } from '../../../core/services/pdfmake.service';
import { SpinnerService } from '../../../core/services/spinner.service';
import { saveAs } from 'file-saver';
import { ToastService } from '../../../core/services/toast.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-order-invoice',
  templateUrl: './order-invoice.component.html',
  styleUrls: ['./order-invoice.component.scss']
})
export class OrderInvoiceComponent implements OnInit {

  @Input() order: any = {};
  constructor(public activeModal: NgbActiveModal, private orderService: OrdersService,
    private pdfMakeService: PdfMakeService, private spinner: SpinnerService, private toastService: ToastService) {

  }
  ngOnInit(): void {
  }

  downloadInvoice(type) {
    this.spinner.start();
    this.orderService.downloadInvoice(
         this.order.id, 
         type        
        ).subscribe((response: HttpResponse<Blob>) => {

            let binaryData = [];
            binaryData.push(response.body);
    
            let downloadLink = document.createElement("a");
            downloadLink.href = window.URL.createObjectURL(
              new Blob(binaryData, { type: "blob" })
            );
    
            let fileName = `file-${Date.now()}.pdf`;
            downloadLink.setAttribute("download", fileName);
            document.body.appendChild(downloadLink);
            downloadLink.click();

      this.spinner.stop();
    }, error => {
      this.spinner.stop();
      this.toastService.error(error);
    });
  }

/*
  downloadInvoice(type) {
    this.spinner.start();
    this.orderService.downloadInvoice(
        { id: this.order.id, 
          type, 
          responseType: 'blob' as 'json',
          observe: 'response', }).subscribe(result => {

      let filePath = `${environment.app_url}/../../${result.filepath}`;
      saveAs(filePath, result.fileName, { autoBom: true });

      // let data = result.data;
      // saveAs(data, result.fileName, { autoBom: true });

      this.spinner.stop();
    }, error => {
      this.spinner.stop();
      this.toastService.error(error);
    });
  }
*/
  dismissModal() {
    this.activeModal.dismiss('dismiss modal');
  }

  closeModal() {
    this.activeModal.close('close modal');
  }

}
