import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { ServerConfig } from 'app/provider/server.config';

@Injectable()
export class ManageOrderService {

    constructor(private http: Http, public server: ServerConfig) { }

    // getList(): Observable<any> {
    //     return this.http.get(this.server.url + 'api/shops', {})
    //         .map((res: Response) => res.json())
    //         .catch((error: any) => Observable.throw(error));
    // }

    searchOrder(typeTab, currentPage, keyword): Observable<any> {
        return this.http.post(this.server.url + 'api/getordersbyadmin', {
            title: typeTab,
            currentpage: currentPage,
            keyword: keyword
        }, this.server.AuthHeaders())
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error));
    }

    orderDetail(orderId, itemId): Observable<any> {
        return this.http.get(this.server.url + 'api/getorderdetail/' + orderId + '/' + itemId, this.server.AuthHeaders())
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error));
    }

    changeStatusRefund(order): Observable<any> {
        return this.http.post(this.server.url + 'api/refunditem/', {
            orderid: order.orderid,
            itemid: order.itemid
        }, this.server.AuthHeaders())
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error));
    }

    changeStatusTransfer(order): Observable<any> {
        return this.http.post(this.server.url + 'api/transferitem/', {
            orderid: order.orderid,
            itemid: order.itemid
        }, this.server.AuthHeaders())
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error));
    }
}