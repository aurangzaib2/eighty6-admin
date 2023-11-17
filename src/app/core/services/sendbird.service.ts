import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import * as SendBird from 'sendbird';
import { ApiService } from '.';
import { environment } from '../../../environments/environment';
import { SpinnerService } from './spinner.service';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class SendBirdService {

  sb = new SendBird({ appId: environment.SEND_BIRD_APP_ID })
  userId: string;
  channel: SendBird.GroupChannel;
  constructor(private spinner: SpinnerService, private apiService: ApiService) { }

  connect(currentUser) {
    this.userId = currentUser.id;
    // The USER_ID below should be unique to your Sendbird application.
    this.sb.connect(this.userId.toString(), (user, error) => {
      if (error) {
        // Handle error.
        ;
      }
      // console.log('send bird user', user);
      this.updateUser(currentUser);
      // The user is connected to Send bird server.
    });
  }

  updateUser(user) {
    let name = user.firstName.toLowerCase() + ' ' + user.lastName.toLowerCase();
    this.sb.updateCurrentUserInfo(name, null, (user, error) => {
      if (error) {
      } else {
        // console.log("updateCurrentUserInfo:user", user);
      }
    })
  }

  createChannel(userIds, NAME, DATA) {
    let COVER_IMAGE_OR_URL = null;
    let CUSTOM_TYPE = [localStorage.getItem('region')];
    return this.sb.GroupChannel.createChannelWithUserIds(userIds, true, NAME, COVER_IMAGE_OR_URL, JSON.stringify(DATA),
      CUSTOM_TYPE.toString(), (groupChannel, error) => {
        if (error) {
          // Handle error.
          return error
        }
        // console.log('channel data', groupChannel)
        // A group channel of the specified users is successfully created.
        // Through the "groupChannel" parameter of the callback function,
        // you can get the group channel's data from the result object that Sendbird server has passed to the callback function.
      });
  }

  getChannelVieUser(ids) {
    let listQuery = this.sb.GroupChannel.createMyGroupChannelListQuery();
    listQuery.userIdsIncludeFilter = ids;
    return listQuery.next((groupChannels, error) => {
      if (error) {
        // Handle error.
      }
      // console.log('is channel exists', groupChannels)
      // Only channelB including {'John', 'Jay', 'Jin'} as a subset is returned in a result list.
    })
  }

  /**
   * get channel by url
   * @param url 
   * @returns 
   */
  getChannel(url) {
    // The CHANNEL_URL below can be retrieved using the openChannel.channelUrl.
    return this.sb.GroupChannel.getChannel(url, (channel, error) => {
      if (error) {
        // Handle error.
      }
      // console.log('channel data', channel)
      this.channel = channel;
    });
  }

  getChannelList() {
    let listQuery = this.sb.GroupChannel.createMyGroupChannelListQuery();
    listQuery.includeEmpty = true;
    listQuery.memberStateFilter = 'all';    // 'all', 'joined_only', 'invited_only', 'invited_by_friend', and 'invited_by_non_friend'
    listQuery.order = 'latest_last_message';    // 'chronological', 'latest_last_message', 'channel_name_alphabetical', and 'metadata_value_alphabetical'
    listQuery.limit = 100;   // The value of pagination limit could be set up to 100.
    listQuery.customTypesFilter = [localStorage.getItem('region')];
    if (listQuery.hasNext) {
      return listQuery.next((groupChannels, error) => {
        if (error) {
          // Handle error.
        }
        // console.log('channel list', groupChannels)
        // A list of group channels is successfully retrieved.
        // Through the "groupChannels" parameter of the callback function,
        // you can access the data of each group channel from the result list that Sendbird server has passed to the callback function.
      });
    }
  }
  filterChannelList(search) {
    let listQuery = this.sb.GroupChannel.createMyGroupChannelListQuery();
    // listQuery.includeEmpty = true;
    // listQuery.memberStateFilter = 'all';    // 'all', 'joined_only', 'invited_only', 'invited_by_friend', and 'invited_by_non_friend'
    // listQuery.order = 'latest_last_message';    // 'chronological', 'latest_last_message', 'channel_name_alphabetical', and 'metadata_value_alphabetical'
    // listQuery.limit = 100;   // The value of pagination limit could be set up to 100.
    listQuery.userIdsIncludeFilter = search;
    listQuery.customTypesFilter = [localStorage.getItem('region')];
    if (listQuery.hasNext) {
      return listQuery.next((groupChannels, error) => {
        if (error) {
          // Handle error.
        }
        // console.log('channel list', groupChannels)
        // A list of group channels is successfully retrieved.
        // Through the "groupChannels" parameter of the callback function,
        // you can access the data of each group channel from the result list that Sendbird server has passed to the callback function.
      });
    }
  }
  sendMessage(message) {
    const params = new this.sb.UserMessageParams();
    params.message = message;
    params.customType = 'text';
    return this.channel.sendUserMessage(params, (message, err) => {
      if (!err) {
        // console.log("onSend:message:", message);
        return message;
      } else {
        return err;
      }
    });
  }
  sendFIle(file) {
    const params = new this.sb.FileMessageParams();
    params.file = file;
    params.customType = 'file';
    return this.channel.sendFileMessage(params, (message, error) => {
      if (!error) {
        // console.log("selectFile:message", message);
        return message;
      } else {
        // console.log("selectFile:err", error);
        return error;
      }
    });
  }
  getPreviousList() {
    const listQuery = this.channel.createPreviousMessageListQuery();
    listQuery.limit = 100;
    listQuery.reverse = false;
    listQuery.includeMetaArray = true;  // Retrieve a list of messages along with their metaarrays.
    return listQuery.load((messageList, error) => {
      if (error) {
        // Handle error.
      }
    });
  }
}
