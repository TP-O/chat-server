import { Catch, ArgumentsHost, BadRequestException } from '@nestjs/common';
import { BaseWsExceptionFilter } from '@nestjs/websockets';
import { Event } from 'src/modules/chat/types/event.type';

@Catch()
export class AllExceptionsFilter extends BaseWsExceptionFilter {
  /**
   * Handle all exceptions.
   *
   * @param exception exception instance.
   * @param host object used to choose the appropriate context.
   */
  catch(exception: Error, host: ArgumentsHost): boolean {
    const server = host.switchToWs();
    const eventName = Object.keys(server.getClient()._events)[1] || 'Unknown';
    let message: string;

    if (exception instanceof BadRequestException) {
      message = this.createBadRequestExceptionMessage(exception);
    } else {
      message = this.createErrorMesssage(exception);
    }

    return server.getClient().emit(Event.FAILURE, {
      event: eventName,
      message: message ?? 'Unexpected error!',
    });
  }

  /**
   * Get error message of bas request exception.
   *
   * @param exception bad request exception
   */
  private createBadRequestExceptionMessage(
    exception: BadRequestException,
  ): string {
    return (exception.getResponse() as any).message[0];
  }

  /**
   * Get error message of error instance.
   *
   * @param exception error instance.
   */
  private createErrorMesssage(exception: Error): string {
    return exception.message;
  }
}
