import { Injectable } from '@nestjs/common';

@Injectable()
export class OperationMiddleware {
  use(req, res, next) {
    console.log(req.user._id);
    next();
  }
}
