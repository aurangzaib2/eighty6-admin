import { Injectable } from '@angular/core';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import { SpinnerService } from './spinner.service';
import * as moment from 'moment';
import { currency, TAX } from '../../helpers';
@Injectable({
  providedIn: 'root'
})
export class PdfMakeService {

  constructor(private spinner: SpinnerService) { }

  async generateInvoice(order, orderItems, logoBase64: string = null) {
    let tax = localStorage.getItem('currency') === currency.UAE ? TAX.UAE : TAX.SA;

    let invoiceDate = moment(order.createdAt).format('MMM DD, yyyy');
    let products = [];
    products.push([{ text: 'Product Code', style: 'tableHeader', border: [false, false, false, false] },
    { text: 'Product Name', style: 'tableHeader', border: [false, false, false, false] },
    { text: 'Unit', style: 'tableHeader', border: [false, false, false, false] },
    { text: 'Quantity', style: 'tableHeader', fontSize: 9, border: [false, false, false, false] },
    { text: 'Unit Price', style: 'tableHeader', border: [false, false, false, false] },
    { text: 'Discount', style: 'tableHeader', border: [false, false, false, false] },
    { text: 'Sub Amount', style: 'tableHeader', border: [false, false, false, false] }]);

    for (let i = 0; i < orderItems.length; i++) {
      let item = orderItems[i];
      products.push([{ text: item.sku, style: 'tableHeaderProduct', margin: [0, 4], border: [false, false, false, true] },
      { text: item.name, style: 'tableHeaderProduct', margin: [0, 4], border: [false, false, false, true] },
      { text: `${item?.unitType} ${item?.units}`, style: 'tableHeaderProduct', margin: [0, 4], border: [false, false, false, true] },
      { text: `${item?.quantity}`, style: 'tableHeaderProduct', margin: [0, 4], border: [false, false, false, true] },
      { text: `${item?.price}`, style: 'tableHeaderProduct', margin: [0, 4], border: [false, false, false, true] },
        { text: `${item?.additionalDiscountPercentage || '-'}`, style: 'tableHeaderProduct', margin: [0, 4], border: [false, false, false, true] },
      { text: `${item?.total.toFixed(2)}`, style: 'tableHeaderProduct', margin: [0, 4], border: [false, false, false, true] }]);
    }
    const documentDefinition = {
      content: [
        {
          style: 'tableExample1',
          table: {
            widths: ['*', '*', '*', 'auto'],
            body: [
              [
                {
                  image: 'suplierLogo',
                  width: 80,
                  border: [false]
                },
                {
                  style: 'tableHeader', colSpan: 2, alignment: 'left', fontSize: 11, border: [false, false, false, false],
                  text: ''
                },
                { text: '', border: [false] },
                {
                  image: await this.getBase64ImageFromURL('../../assets/images/logo.png'),
                  width: 100,
                  border: [false]
                },
              ]
            ]
          },
          layout: {
            vLineColor: function (i, node) {
              return '#4472C4';
            },
          }
        },
        { text: `${order?.supplier?.name}\n`, bold: true, style: "tableHeader", margin: [2, 1], },
        { text: `${order?.supplier?.location}\n`, bold: true, style: "tableHeader", margin: [2, 1], },
        {
          alignment: "justify", margin: [2, 1],
          columns: [
            {
              image: await this.getBase64ImageFromURL(`../../assets/icons/blue-message.png`),
              width: 8,
              margin: [0, 3, 3, 0]
            },
            {
              text: `${order?.supplier?.email}`, style: "tableHeader", margin: [3, 0, 0, 0]
            }
          ]
        },
        {
          alignment: "justify", margin: [2, 1],
          columns: [
            {
              image: await this.getBase64ImageFromURL(`../../assets/icons/blue-phone.png`),
              width: 8,
              margin: [0, 1, 3, 0]
            },
            {
              text: `+${order?.supplier?.mobileCode}${order?.supplier?.mobileNumber}`, style: "tableHeader", margin: [3, 0, 0, 0]
            }
          ]
        },
        {
          margin: [2, 1],
          text: [
            { text: `TRN no: `, fontSize: 9, color: "black" },
            { text: `${order?.supplier?.trnNumber || '-'}`, style: "tableHeader" }
          ]
        },
        {
          text: 'Tax Invoice',
          style: 'subheader', fontSize: 18, color: 'black', margin: [0, 8]
        },
        {
          style: 'tableAdddress', margin: [2, 0, 0, 0],
          columnGap: 20,
          columns:
            [
              {
                style: 'tableHeader', fontSize: 10,
                stack: [
                  { text: `BILL TO\n`, bold: true, color: "#1f2229", },
                  { text: `${order?.restaurant?.name}\n`, bold: true, fontSize: 9, color: '#0b72cf', margin: [0, 3, 0, 2] },
                  { text: `${order?.restaurant?.location}\n`, bold: true, fontSize: 9 },
                  // { text: `${order?.restaurant?.email}\n`, italics: false, fontSize: 9 },
                  {
                    columnGap: 0,
                    margin: [0, 2],
                    columns: [
                      {
                        image: await this.getBase64ImageFromURL(`../../assets/icons/blue-message.png`),
                        width: 8,
                        margin: [0, 3, 3, 0]
                      },
                      {
                        text: `${order?.restaurant?.email}`, style: "tableHeader", margin: [3, 0, 0, 0]
                      }
                    ],
                  },
                  // { text: `+${order?.restaurant?.mobileCode} ${order?.restaurant?.mobileNumber} \n`, italics: false, fontSize: 9 },
                  {
                    columnGap: 0,
                    columns: [
                      {
                        image: await this.getBase64ImageFromURL(`../../assets/icons/blue-phone.png`),
                        width: 8,
                        margin: [0, 1, 3, 0]
                      },
                      {
                        text: `+${order?.restaurant?.mobileCode}${order?.restaurant?.mobileNumber}`, style: "tableHeader", margin: [3, 0, 0, 0]
                      }
                    ]
                  },
                  {
                    margin: [0, 2],
                    text: [
                      { text: `TRN no: `, fontSize: 9, color: "black" },
                      { text: `${order?.restaurant?.trnNumber || '-'}`, style: "tableHeader" }
                    ]
                  },
                ]
              },
              {
                style: 'tableHeader', alignment: 'left', fontSize: 10,
                stack: [
                  { text: `SHIP TO\n`, bold: true, color: "#1f2229" },
                  { text: `${order?.restaurant?.name}\n`, bold: true, fontSize: 9, color: '#0b72cf', margin: [0, 3, 0, 1] },
                  { text: `${order?.restaurant?.location}\n`, italics: false, fontSize: 9 },
                ]
              },
              {
                border: [false, false, false, false],
                table: {
                  body: [
                    [{ text: `INVOICE NO`, bold: true, alignment: "right", border: [false] },
                    { text: ` ${order?.invoiceId}`, color: '#858585', border: [false] }
                    ],
                    [{ text: `INVOICE DATE`, bold: true, alignment: "right", border: [false] },
                    { text: ` ${invoiceDate}\n`, color: '#858585', border: [false] }
                    ],
                    [{ text: `PAYMENT MODE`, bold: true, alignment: "right", border: [false] },
                    { text: ` ${this.capitalize(order?.paymentMethod)}\n`, color: '#858585', border: [false] }
                    ],
                    [{ text: ` SALES PERSON`, bold: true, alignment: "right", border: [false] },
                    { text: `-\n`, color: '#858585', border: [false] }
                    ],
                    [{ text: `TRUCK PERSON`, bold: true, alignment: "right", border: [false] },
                    { text: `-\n`, color: '#858585', border: [false] }
                    ]
                  ]
                },
              },
            ]
        },
        {
          style: 'tableProduct', border: [false, false, false, false], margin: [0, 14, 0, 0],
          table: {
            widths: ['*', 'auto', '*', '*', '*', '*', '*'],
            headerRows: 1,
            body: products
          },
          layout: {
            hLineColor: function (i, node) {
              return '#f5f5f5';
            },
          }
        },
        {
          margin: [0, 8],
          table: {
            widths: ['60%', '2%', '*'],
            body: [
              [
                {
                  style: 'orderDetails', border: [false, false, false, true],
                  table: {
                    widths: ['*', '*'],
                    body: [
                      [{ text: '', border: [false] }, { text: '', border: [false] }],
                      [{ text: '', border: [false] }, { text: '', border: [false] }],
                      [{ text: '', border: [false] }, { text: '', border: [false] }],
                      [{ text: '', border: [false] }, { text: '', border: [false] }],
                      [{ text: '', border: [false] }, { text: '', border: [false] }],
                      [{ text: `Receiver Name :`, style: 'orderDetailsHeader', margin: [0, 3], border: [false, false, false, false], alignment: "left" },
                      { text: ``, style: "orderDetailsValue", margin: [0, 3], border: [false, false, false, false] }
                      ],
                      [{ text: `Signature :`, style: 'orderDetailsHeader', margin: [0, 3], border: [false, false, false, false], alignment: "left" },
                      { text: ``, style: "orderDetailsValue", margin: [0, 3], border: [false, false, false, false] }
                      ],
                      [{ text: `Stamp :`, style: 'orderDetailsHeader', margin: [0, 3], border: [false, false, false, false], alignment: "left" },
                      { text: ``, style: "orderDetailsValue", border: [false, false, false, false] }
                      ],
                    ]
                  },
                },
                {
                  border: [false, false, false, false],
                  text: ''
                },
                {
                  style: 'orderDetails', border: [false, false, false, true],
                  table: {
                    widths: ['*', '*'],
                    body: [
                      [{ text: 'Order Details', color: "black", border: [false], }, { text: '', color: "black", border: [false] }],
                      [{ text: `Order Amount`, style: 'orderDetailsHeader', margin: [0, 5], border: [false, false, false, true], alignment: "left" },
                      { text: ` ${localStorage.getItem('currency')} ${order.subTotal.toFixed(2)} \n`, style: "orderDetailsValue", margin: [0, 5], border: [false, false, false, true] }],
                      [{ text: order?.voucher ? `Promo code (${order?.voucher})` : 'Promo Code', style: 'orderDetailsHeader', margin: [0, 5], border: [false, false, false, true], alignment: "left" },
                      { text: ` ${localStorage.getItem('currency')} ${order.discountedPromoPrice} \n`, style: "orderDetailsValue", margin: [0, 5], border: [false, false, false, true] }
                      ],
                      [{ text: `Discount`, style: 'orderDetailsHeader', margin: [0, 5], border: [false, false, false, true], },
                      { text: ` ${order?.discountInPercentage} %\n`, style: "orderDetailsValue", margin: [0, 5], border: [false, false, false, true] }
                      ],
                      [{ text: `Total before VAT`, style: 'orderDetailsHeader', margin: [0, 5], alignment: "left", border: [false, false, false, true], },
                      { text: ` ${localStorage.getItem('currency')} ${order?.totalPrice.toFixed(2)}\n`, style: "orderDetailsValue", margin: [0, 5], alignment: "right", border: [false, false, false, true] }
                      ],
                      [{ text: `VAT (${tax} %)`, style: 'orderDetailsHeader', margin: [0, 5], alignment: "left", border: [false, false, false, true], },
                      { text: ` ${localStorage.getItem('currency')} ${order?.tax?.toFixed(2)}\n`, style: "orderDetailsValue", margin: [0, 5], alignment: "right", border: [false, false, false, true] }
                      ],
                      [{ text: `PAYMENT MODE`, style: 'orderDetailsHeader', margin: [0, 5], border: [false, false, false, false] },
                      { text: ` ${this.capitalize(order?.paymentMethod)}\n`, style: "orderDetailsValue", margin: [0, 5], border: [false, false, false, false] }
                      ],
                    ]
                  },
                  layout: {
                    hLineColor: function (i, node) {
                      return '#f5f5f5';
                    },
                  }
                },
              ],
              [
                {
                  border: [false, false, false, false],
                  text: ''
                },
                {
                  border: [false, false, false, false],
                  text: ''
                },
                {
                  style: 'orderDetails', border: [false, false, false, false],
                  table: {
                    widths: ['*', '*'],
                    body: [
                      [{ text: `TOTAL`, bold: true, fontSize: 9, color: '#1f2229', alignment: "left", border: [false, false, false, false], },
                      { text: ` ${localStorage.getItem('currency')} ${(order?.totalPrice + order?.tax).toFixed(2)}\n`, fontSize: 9, color: '#0099ff', alignment: "right", border: [false] }
                      ],
                    ]
                  },
                },
              ]
            ]
          },
          layout: {
            hLineColor: function (i, node) {
              return '#f5f5f5';
            },
          }
        },
        //  footer
        {
          text: 'Terms & Conditions',
          style: 'subheader', fontSize: 9, color: "black", bold: true, margin: [4, 4, 0, 0]
        },
        {
          ol: [
            { text: 'GOODS RECEIVED IN FULL AND IN GOOD CONDITION.' },
            { text: 'CLIENT HAS CHECKED AND ACCEPTED THE PRODUCTION AND EXPIRY DATES ON DELIVERY.' },
            {
              text: [
                { text: 'ANY DISCREPANCIES OR DAMAGES TO BE REPORTED ON DELIVERY OR WITHIN 24 HOURS TO THE VENDOR AND ' },
                { text: 'support@eighty6.shop', color: '#0b72cf' }
              ],
            },
            { text: 'CLAIMS OR RETURNS AFTER 24 HOURS, SUBJECT TO VENDOR AND Eighty6 MANAGEMENT APPROVAL.' },
            {
              text: 'Eighty6 WILL NOT BE LIABLE OR RESPONSIBLE FOR ANY CLAIMS ON QUALITY, QUANTITY AND EXPIRY. POST 24 HOURS OF DELIVERY.',
            },
            { text: "FULLY OR PARTIALLY USED PRODUCTS / OR QUALITY TAMPERED / SPOILAGES DUE TO ANY NEGLIGENCE IN HANDLING AT CLIENT FACILITY / POSSESSION WON'T BE REFUNDED / REPLACED." },
            { text: 'CLIENT LIABLE AND RESPONSIBLE TO PAY THE COST OF GOODS AND NECESSARY TAXES.' },
            { text: 'NO CORRECTION / ALTERATIONS ON TAX INVOICE TO BE MADE.', },
            { text: 'CASH PAYMENT ONLY UPTO THE TAX INVOICE VALUE WITH CORRESPONDING RECEIPT.' },
            { text: 'ANY DISPUTES WILL BE SETTLED IN UAE COURT OF LAW(DUBAI).' }
          ],
          style: 'termsAndConditions', fontSize: 6, color: "grey", margin: [4, 4, 0, 0]
        },
      ],
      styles: {
        header: {
          fontSize: 9,
          bold: true,
        },
        subheader: {
          fontSize: 9,
          bold: true,
        },
        tableProduct: {
          fontSize: 9,
          color: 'black',
          border: [false],
          padding: 0
        },
        tableHeaderProduct: {
          bold: false,
          color: 'black',
          fontSize: 9,
        },
        tablebody: {
          fontSize: 9,
          color: '#1f2229',
          border: [false, false, false, false],
          padding: 0
        },
        tableAdddress: {
          fontSize: 9,
          color: 'black'
        },
        tableHeader: {
          bold: false,
          fontSize: 9,
          color: '#9e9e9e',
        },
        orderDetailsHeader: {
          bold: false,
          fontSize: 9,
          color: '#858585',
        },
        orderDetailsValue: {
          bold: false,
          fontSize: 9,
          color: '#858585',
          alignment: "right",
        },
      },
      //       footer: {
      //         stack: [
      //             {
      // 			text: 'Terms & Conditions',
      // 			style: 'subheader',fontSize: 9, color: "black",bold:true,margin: [36, 0, 0, 0]
      //         },
      //         {
      //             text:"There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in . All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words.",
      //             styele:'termsAndConditions',fontSize: 7, color: "grey",margin: [36, 0,36, 0]
      //         },
      //         ]
      //       },
      images: {
        suplierLogo: logoBase64 ? logoBase64 : await this.getBase64ImageFromURL(`../../assets/images/placeholder_logo.png`)
      }
    };
    pdfMake.createPdf(documentDefinition).download();
    this.spinner.stop();
  }

  getBase64ImageFromURL(url) {
    return new Promise((resolve, reject) => {
      var img = new Image();
      img.setAttribute("crossOrigin", "anonymous");

      img.onload = () => {
        var canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;

        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        var dataURL = canvas.toDataURL("image/png");

        resolve(dataURL);
      };

      img.onerror = error => {
        reject(error);
      };

      img.src = url;
    });
  }
  capitalize(phrase) {
    if (phrase) {
      return phrase
        .toLowerCase()
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
    return ''
  }
}
