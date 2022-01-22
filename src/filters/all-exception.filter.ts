import { Catch, ArgumentsHost, BadRequestException } from '@nestjs/common';
import { BaseWsExceptionFilter } from '@nestjs/websockets';
import { Event } from 'src/modules/chat/types/event.type';

@Catch()
export class AllExceptionsFilter extends BaseWsExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const server = host.switchToWs();
    const eventName = Object.keys(server.getClient()._events)[1] || 'Unknown';
    const messages: string[] = [];

    if (exception instanceof BadRequestException) {
      messages.push(...this.createBadRequestExceptionMessage(exception));
    } else {
      messages.push(this.createDefaultMesssage(exception));
    }

    return server.getClient().emit(Event.EXCEPTION, {
      event: eventName,
      messages,
    });
  }

  private createBadRequestExceptionMessage(exception: BadRequestException) {
    return (exception.getResponse() as any).message;
  }

  private createDefaultMesssage(exception: Error) {
    return exception.message;
  }
}
