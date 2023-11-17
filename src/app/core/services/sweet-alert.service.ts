import {Injectable} from "@angular/core";
import Swal from 'sweetalert2/dist/sweetalert2.js';


@Injectable()

export class SweetAlertService {

  constructor() {
  }

  delete(name) {
    return Swal.fire({
      title: `Are you sure you want to Delete ${name}?`,
      text: `You will not be able to recover ${name}!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete!',
      confirmButtonColor: '#2b2a2a',
      cancelButtonText: 'No, keep it'
    })
  }

  status(name, status,type?) {
    let statusText;
    if (status === 'approved' || status === 'unapproved') {
      statusText = status === 'approved' ? 'Approve' : 'Reject';
    }else if(type === 'package'){
      statusText = status === 'active' ? 'De Activate' : 'Activate';
    }else if(type === 'event'){
      statusText = status === 'published' ? 'Un Publish' : 'Publish'
    }
    else{
      statusText = status === 'active' ? 'Block' : 'Unblock';
    }
    return Swal.fire({
      title: `Are you sure you want to ${statusText} ${name}?`,
      text: ``,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: `Yes, ${statusText!}`,
      confirmButtonColor: '#2b2a2a',
      cancelButtonText: 'No, keep it'
    })
  }

  success(title?) {
    return Swal.fire({
      title: `Your ${title} has been Updated!`,
      text: ``,
      icon: 'success',
      showCancelButton: false,
      confirmButtonText: 'Got it',
      confirmButtonColor: '#2b2a2a',
      cancelButtonText: 'No, keep it'
    })
  }

  globalSuccess(title?,cbText?, icon?) {
    return Swal.fire({
      title: `${title}`,
      text: ``,
      icon: icon || 'success',
      showCancelButton: !!cbText,
      confirmButtonText: 'Got it',
      confirmButtonColor: '#2b2a2a',
      cancelButtonText: `${cbText}`
    })
  }

}
