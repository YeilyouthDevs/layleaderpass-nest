import { Injectable } from '@nestjs/common';
import { Response } from 'express';

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

}
