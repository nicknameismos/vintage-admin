import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { ServerConfig } from 'app/provider/server.config';

@Injectable()
export class ManageCouponService {

    constructor(private http: Http, public server: ServerConfig) { }

    // getList(): Observable<any> {
    //     return this.http.get(this.server.url + 'api/shops', {})
    //         .map((res: Response) => res.json())
    //         .catch((error: any) => Observable.throw(error));
    // }

    createCoupon(): Observable<any> {
        return this.http.post(this.server.url + 'api/coupons', {}, this.server.AuthHeaders())
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error));
    }
}