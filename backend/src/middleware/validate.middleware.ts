
import { Request, Response, NextFunction, RequestHandler } from 'express';
import { z } from 'zod';

//Middleware réutilisable qui valide le format des données via ZodType, 
// safeParse() renvoie un objet de validation échoué ou réussi, 
// next(result.error) quitte le parcours et renvoie au middleware de gestion d'erreur//
export function validate(schema: z.ZodType): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return next(result.error);
    }

    req.body = result.data;

    next();
  };
}
