import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      message = typeof res === 'string' ? res : (res as any).message;
    } else if ((exception as any).code === '23505') {
      // Ошибка уникальности (дубликат)
      status = HttpStatus.CONFLICT;
      message = 'Duplicate entry (such record already exists)';
    } else if ((exception as any).code === '22P02') {
      // Ошибка формата UUID
      status = HttpStatus.BAD_REQUEST;
      message = 'Invalid UUID format';
    }

    response.status(status).json({
      statusCode: status,
      message,
    });
  }
}