import { Request, Response, NextFunction } from 'express'
import { validateSign } from '../utilities'


export const Authenticate = async (req: Request, res: Response, next: NextFunction) => {
    const isValid = await validateSign(req)
    if (isValid) {
        return next()
    } else {
        return res.status(403).send({ message: "Authentication Failed"})
    }
}