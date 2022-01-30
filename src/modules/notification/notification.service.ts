import { Injectable } from '@nestjs/common';
import { isEmpty } from 'class-validator';
import { Event } from 'src/types/event.type';
import { NotificationInput } from 'src/types/notification.type';

@Injectable()
export class NotificationService {
  /**
   * Notify a notification.
   *
   * @param input notification's input.
   */
  notify<T>(input: NotificationInput<T>): void {
    if (!isEmpty(input.to) && input.to.length) {
      input.server.to(input.to).emit(input.event, input.notification);
    }
  }

  /**
   * Notify a successful notification.
   *
   * @param input successful notification's input.
   */
  notifySuccess<T>(input: Omit<NotificationInput<T>, 'event'>): void {
    input.notification.message === input.notification.message ?? 'Completed!';

    this.notify<T>({ ...input, event: Event.SUCCESS });
  }

  /**
   * Notify a failed notification.
   *
   * @param input failed notification's input.
   */
  notifyFailure<T>(input: Omit<NotificationInput<T>, 'event'>): void {
    input.notification.message === input.notification.message ??
      'Unexpected error!';

    this.notify<T>({ ...input, event: Event.FAILURE });
  }
}
