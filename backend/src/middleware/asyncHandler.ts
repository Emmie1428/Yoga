import { Request, Response, NextFunction, RequestHandler } from 'express';


//asyncHandler transmet les erreurs à error.,iddleware sans faire de try/catch dans chaque//
export function asyncHandler(
  handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}