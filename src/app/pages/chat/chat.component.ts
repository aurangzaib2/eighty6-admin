import { AfterViewChecked, Component, HostListener, ElementRef, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { User } from 'sendbird';
import { UserService } from '../../core';
import { SendBirdService } from '../../core/services/sendbird.service';
import { SpinnerService } from '../../core/services/spinner.service';
import { saveAs } from 'file-saver';
import { MetadataOverride } from '@angular/core/testing';
import { MetadataService } from '../../core/services/metadata.service';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy {

  userList = [];
  originalList = [];
  message: string;
  selectedUser: any = {};
  pastMessageList: Array<SendBird.UserMessage | SendBird.FileMessage | SendBird.AdminMessage> = [];
  messages = [];
  currentUser: any = {};
  setTimeOut: any;
  params = {};
  @ViewChild('scrollMe') private myScrollContainer: ElementRef;
  constructor(private sendBirdService: SendBirdService, private route: ActivatedRoute, private spinner: SpinnerService,
    private userService: UserService, private router: Router, private metadataService: MetadataService, public translate: TranslateService) {
    this.userService.refreshTable.subscribe((data) => {
      this.params = {};
      this.getData();
    })
  }

  ngOnInit(): void {
    this.userService.currentUser.subscribe(data => {
      this.currentUser = data;
      this.route.queryParams.subscribe(params => {
        if (params['id']) {
          this.params = {
            id: params['id']
          }
        }
        this.getData();
      });
    });
  }
  getData() {
    this.userList = this.originalList = [];
    this.selectedUser = {};
    this.sendBirdService.getChannelList().then((data) => {
      this.userList = data;
      this.originalList = data;
      // console.log(this.originalList)
      this.customSender();
      if (Object.keys(this.selectedUser).length === 0) {
        if (this.params['id']) {
          this.getChannelByUrl(this.params['id'])
        }
        else {
          if (this.userList.length > 0) {
            this.selectUser(this.userList[0])
          }
        }
      }
      // this.route.queryParams.subscribe(params => {
      //   if (Object.keys(this.selectedUser).length === 0) {
      //     if (params['id']) {
      //       this.getChannelByUrl(params['id'])
      //     }
      //     else {
      //       if (this.userList.length > 0) {
      //         this.selectUser(this.userList[0])
      //       }
      //     }
      //   }
      // })
    });
  }
  ngOnDestroy() {
    clearInterval(this.setTimeOut)
  }
  customSender() {
    this.userList.forEach(element => {
      element.senderName = this.checkSender(element);
    })
  }

  checkSender(item) {
    if (item.data) {
      item.newData = JSON.parse(item.data);
    }
    else {
      item.newData = {};
    }
    if (item.creator.userId === this.currentUser.id.toString()) {
      return item.newData.receiver;
    }
    else {
      return item.newData.sender;
    }
  }

  createTime(time) {
    return new Date(time)
  }

  getChannelByUrl(url) {
    this.sendBirdService.getChannel(url).then(data => {
      this.selectUser(data);
    })
  }
  selectUser(user) {
    clearInterval(this.setTimeOut);
    this.spinner.start();
    this.selectedUser = user;
    this.sendBirdService.getChannel(user.url).then((data) => {
      this.getPreviousMessage();
      this.spinner.stop();
    });
  }
  startTimer() {
    this.setTimeOut = setInterval(async () => {
      this.pastMessageList = await this.sendBirdService.getPreviousList();
      for (let i = 0; i < this.pastMessageList.length; i++) {
        if (this.messages.findIndex(x => x._id === this.pastMessageList[i].messageId) === -1) {
          this.customizeMessage(this.pastMessageList[i]);
        }
      }
    }, 2000)
  }
  async getPreviousMessage() {
    this.messages = [];
    this.pastMessageList = [];
    this.pastMessageList = await this.sendBirdService.getPreviousList();
    for (let i = 0; i < this.pastMessageList.length; i++) {
      if (this.messages.findIndex(x => x._id === this.pastMessageList[i].messageId) === -1) {
        this.customizeMessage(this.pastMessageList[i]);
      }
    }
    this.startTimer();
    this.spinner.stop();
  }
  uploadImage(event) {
    let file = event.target.files[0];
    file.url = event.target.value;
    let messageObject = this.sendBirdService.sendFIle(file);
    this.createNotification();
    // this.customizeMessage(messageObject);
    this.scrollToBottom();
    this.message = null;
    this.spinner.stop();
  }
  sendMessage() {
    this.spinner.start();
    let messageObject = this.sendBirdService.sendMessage(this.message);
    this.createNotification();
    // this.customizeMessage(messageObject);
    this.scrollToBottom();
    this.message = null;
    this.spinner.stop();
  }
  createNotification() {
    let arr = JSON.parse(JSON.stringify(this.selectedUser.members)).find(x => x.userId !== this.currentUser.id.toString());
    let payload = {
      receiverId: arr.userId,
      senderId: this.currentUser.id,
      message: `You have a message from ${this.currentUser.firstName} ${this.currentUser.lastName}. Click here to view the message.`,
      additional: JSON.stringify({ channelUrl: this.selectedUser.url, name: this.selectedUser.name }),
      title: `Chat message`,
      type: 'chat_message',
    }
    this.metadataService.createNotification(payload).subscribe(result => {
    })
  }
  scrollToBottom(): void {
    try {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch (err) { }
  }
  customizeMessage(msg) {
    let user = {};
    if (msg.messageType === "admin") {
      user = {
        _id: 1,
      }
    }
    else if (msg?.sender?.userId === this.currentUser.id.toString()) {
      user = {
        _id: 'me',
      }
    }
    else {
      user = {
        _id: parseInt(msg.sender.userId),
        name: msg.sender.nickname,
        avatar: msg.sender.plainProfileUrl,
      }
    }
    if (msg.customType === "file") {
      let date = new Date(msg.createdAt);
      this.messages.push({
        _id: msg.messageId,
        text: msg.name,
        createdAt: date.getTime(),
        user: user,
        image: msg.url,
        type: msg.type,
        customType: msg.customType,
        mentionType: msg.mentionType
      })
    } else {
      let date = new Date(msg.createdAt);
      this.messages.push({
        _id: msg.messageId,
        text: msg.message,
        createdAt: date.getTime(),
        user: user,
        customType: msg.customType,
        mentionType: msg.mentionType
      })
    }
  }

  /**
   * download file
   * @param data 
   */
  downloadFile(data) {
    if (data.name || data.text) {
      saveAs(data.image, data.name, { autoBom: true });
    }
  }

  myMethodChangingQueryParams(id) {
    this.router.navigate(
      ['.'],
      {
        relativeTo: this.route,
        queryParams: { id: id },
        queryParamsHandling: 'merge', // remove to replace all query params by provided
      });
  }

  @HostListener('scroll', ['$event'])
  onScroll(event: any) {
    // visible height + pixel scrolled >= total height 
    if (event.target.offsetHeight + event.target.scrollTop >= event.target.scrollHeight) {
      if (this.userList.length === 100) {
        this.sendBirdService.getChannelList().then((data) => {
          this.userList = this.userList.concat(data);
          this.customSender();
        });
      }
    }
  }

  searchUser(search) {
    if (search) {
      let arr = this.originalList;
      let filter = arr.filter(function (channel) {
        if ((channel.senderName.trim().toLowerCase()).match(search.toLowerCase())) {
          return channel;
        }
      }
      )
      if (filter.length > 0) {
        let ids = filter[0].members.map(user =>
          user.userId
        )
        // console.log(ids)
        this.sendBirdService.filterChannelList(ids).then((data) => {
          this.userList = data;
          this.customSender();
        })
      }
    }
    else {
      this.sendBirdService.getChannelList().then((data) => {
        this.userList = data;
        this.customSender();
      })
    }
  }

  create_human_friendly_date(timestamp,
    yesterday_text,
    today_text,
    tomorrow_text,
    language
  ) {
    var in_the_last_7days_date_options = { weekday: 'long' };
    var in_the_next_7days_date_options = { month: 'short', day: 'numeric' };
    var same_year_date_options = { month: 'short', day: 'numeric' };
    var far_date_options = { year: 'numeric', month: 'short', day: 'numeric' };

    var dt = new Date(timestamp);
    var date = dt.getDate();
    var time_diff = timestamp - Date.now();
    var diff_days = new Date().getDate() - date;
    var diff_months = new Date().getMonth() - dt.getMonth();
    var diff_years = new Date().getFullYear() - dt.getFullYear();

    var is_today = diff_years === 0 && diff_months === 0 && diff_days === 0;
    var is_yesterday = diff_years === 0 && diff_months === 0 && diff_days === 1;
    var is_tomorrow = diff_years === 0 && diff_months === 0 && diff_days === -1;
    var is_in_the_last_7days = diff_years === 0 && diff_months === 0 && (diff_days > 1 && diff_days < 7);
    var is_in_the_next_7days = diff_years === 0 && diff_months === 0 && (diff_days < -1 && diff_days > -7);
    var is_same_year = diff_years === 0;

    if (is_today && timestamp) {
      return moment(timestamp).format('hh:mm a');
    } else if (is_yesterday && timestamp) {
      return yesterday_text;
    } else if (is_tomorrow && timestamp) {
      return tomorrow_text;
    } else if (is_in_the_last_7days && timestamp) {
      return moment(timestamp).format('MMMM DD, yyyy');
    } else if (is_in_the_next_7days && timestamp) {
      return moment(timestamp).format('MMM DD, yyyy');
    } else if (is_same_year && timestamp) {
      return moment(timestamp).format('MMM DD, yyyy');
    } else if (timestamp) {
      return moment(timestamp).format('MMM DD, yyyy');
    }
  }
}
