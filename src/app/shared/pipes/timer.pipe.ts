import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
    name: 'timer'
})

export class Timer implements PipeTransform {


    transform(date: string, value = {}): any {
        if (value['confirmedAt']) {
            let startTime = moment(date);
            let end = moment(value['confirmedAt']);
            let ms = moment(end, "DD/MM/YYYY HH:mm:ss").diff(moment(startTime, "DD/MM/YYYY HH:mm:ss"));
            let d = moment.duration(ms);
            let time = Math.floor(d.asHours()) + moment.utc(ms).format(":mm");
            return {
                time: (time),
                class: d.asHours() >= 4 ? 'red-badge' : 'green-badge'
            };
        } else {
            let startTime = moment(date);
            let ms = moment(new Date(), "DD/MM/YYYY HH:mm:ss").diff(moment(startTime, "DD/MM/YYYY HH:mm:ss"));
            let d = moment.duration(ms);
            let time = Math.floor(d.asHours()) + moment.utc(ms).format(":mm");
            return {
                time: (time),
                class: d.asHours() >= 4 ? 'red-badge' : 'green-badge'
            };
        }
    }

}
