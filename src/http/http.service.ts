import { Injectable } from '@nestjs/common';
import { Request, Response } from 'express';

@Injectable()
export class HttpService {

    setCookie(res: Response, name: string, value: string, ageInMillis?: number) {
        return res.cookie(name, value, {
            httpOnly: true,
            secure: false,
            sameSite: 'strict',
            maxAge: ageInMillis
        })
    }

    deleteCookie(res: Response, name: string) {
        return this.setCookie(res, name, '', 0);
    }

    getIpAddress(req: Request) {
        return req.headers['x-forwarded-for'] as string || req.ip || 'undefined';
    }

}
