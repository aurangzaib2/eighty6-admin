import { Component, Input, OnInit } from "@angular/core"; 
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { NgbActiveModal, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { CardService } from "../../../core/services/card.service";
import { SpinnerService } from "../../../core/services/spinner.service";
import { ToastService } from "../../../core/services/toast.service";
import {
  profileFromErrors,
} from "../../../helpers";
import { UploadService } from "../../../core";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: "app-card-form",
  templateUrl: "./card-form.component.html",
  styleUrls: ["./card-form.component.scss"],
})
export class CardFormComponent implements OnInit {
  @Input() restaurantData: any = {};
  @Input() isEditable: boolean = false;
  cardsList = [];
  selectedCardInstrumentId: any;
  amount: any;
  cardNumber: any;
  expiry: any;
  cvv: any;
  selectedCardIdErrorMessage = false;
  amountErrorMessage = false;
  cardNumberErrorMessage = false;
  expiryErrorMessage = false;
  cvvErrorMessage = false;
  cardForm = new FormGroup({
    id: new FormControl(null),
    restaurant: new FormControl("", [Validators.required]),
    amount: new FormControl("", [Validators.required]),
    cardNumber: new FormControl("", [Validators.required]),
    cvv: new FormControl("", [Validators.required]),
    expiry: new FormControl("", [Validators.required]),
  });
  errorMessages = profileFromErrors;
  loading = false;

  displayMessage: string = null;
  constructor(
    public modalService: NgbModal,
    public activeModal: NgbActiveModal,
    private cardService: CardService,
    private spinner: SpinnerService,
    private toastService: ToastService,
    private uploadService: UploadService,
    public translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.getCards();
  }

  get form() {
    return this.cardForm.controls;
  }
  clearDisplayMessage() {
    this.displayMessage = null;
  }
  toggleEdit() {
    this.isEditable = !this.isEditable;
  }
  customizeRoleText(text): string {
    return text.replace("_", " ").toLowerCase();
  }

  getCards() {
    this.spinner.start();
    this.cardService
      .getAllCards({ start: 0, length: 500, search: { value: "" } })
      .subscribe(
        (result) => {
          this.cardsList = result.data;
          this.spinner.stop();
        },
        (error) => {
          this.spinner.stop();
        }
      );
  }

  /**
   * set country
   * @param name
   */
  setCard(instrumentId) {
    this.selectedCardInstrumentId = instrumentId;
    this.selectedCardIdErrorMessage = false;
  }

  setAmount(amount) {
    this.amount = amount;
    if (this.amount != 0) {
      this.amountErrorMessage = false;
    }
  }

  setCardNumber(cardNumber) {
    this.cardNumber = cardNumber;
    if (this.cardNumber.toString().length == 16) {
      this.cardNumberErrorMessage = false;
    } else {
      this.cardNumberErrorMessage = true;
    }
  }

  setExpiry(expiry) {
    this.expiry = expiry;
    if (
      this.expiry.includes("/") &&
      this.expiry.split("/")[0].length <= 2 &&
      this.expiry.split("/")[0].length > 0 &&
      parseInt(this.expiry.split("/")[0]) < 13 &&
      parseInt(this.expiry.split("/")[0]) > 0 &&
      this.expiry.split("/")[1].length == 4
    ) {
      this.expiryErrorMessage = false;
    } else {
      this.expiryErrorMessage = true;
    }
  }

  setCvv(cvv) {
    this.cvv = cvv;
    if (this.cvv.toString().length == 3) {
      this.cvvErrorMessage = false;
    } else {
      this.cvvErrorMessage = true;
    }
  }

  /**
   * APi call to topup
   */
  onSubmit() {

    //For Topup existing Card
    if (this.restaurantData.id) {
      
      if (!this.amount || this.amount == 0) {
        this.amountErrorMessage = true;
        return;
      }

      this.loading = true;
      this.cardService
        .topUpUsingCashTransfer({
          restaurantId: this.restaurantData.id,
          amount: this.amount,
        })
        .subscribe(
          (data) => {
            this.loading = false;
            this.toastService.success(data);
            this.dismissModal();
          },
          (error) => {
            this.loading = false;
            this.displayMessage = this.translate.instant('translations.somethingWrong');
          }
        );
    } 
    //For Adding a New Card
    else 
    {
      if (!this.cardNumber || this.cardNumberErrorMessage == true) {
        this.cardNumberErrorMessage = true;
        return;
      }
      if (!this.expiry || this.expiryErrorMessage == true) {
        this.expiryErrorMessage = true;
        return;
      }
      if (!this.cvv || this.cvvErrorMessage == true) {
        this.cvvErrorMessage = true;
        return;
      }
      this.loading = true;
      this.cardService
        .getToken({
          type: "card",
          cardNumber: this.cardNumber.toString(),
          expiryMonth: this.expiry.split("/")[0].toString(),
          expiryYear: this.expiry.split("/")[1].toString(),
          cvv: this.cvv.toString(),
        })
        .subscribe(
          (data) => {
            this.cardService
              .topup({
                userId: 1,
                tokenId: data.data.token,
                cardsourceId: "",
                amount: 0,
              })
              .subscribe(
                (data) => {
                  this.toastService.success(data);
                  this.dismissModal();
                },
                (error) => {
                  this.loading = false;
                  this.displayMessage = this.translate.instant('translations.somethingWrong');
                }
              );
            // this.toastService.success(data);
            this.dismissModal();
          },
          (error) => {
            this.loading = false;
            this.displayMessage = this.translate.instant('translations.somethingWrong');
          }
        );
    }
  }
  /**
   * open modal to confirm status change
   */
  /**
   * change status of user
   */

  /**
   * open modal to confirm delete
   */
  /**
   * delete user request
   */
  /**
   * dismiss modal
   */
  dismissModal() {
    this.modalService.dismissAll("dismiss modal");
  }
  /**
   * close modal
   */
  closeModal() {
    this.activeModal.close("close modal");
  }
}
