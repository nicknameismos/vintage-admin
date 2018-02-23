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

    changeStatusConfirm(order): Observable<any> {
        return this.http.post(this.server.url + 'api/confirmitem/', {
            orderid: order.orderid,
            itemid: order.itemid
        }, this.server.AuthHeaders())
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error));
    }

    adminStatusConfirm(order, shipping): Observable<any> {
        return this.http.put(this.server.url + 'api/updateorderbid/' + order.orderid, {
            shippingAddress: shipping
        }, this.server.AuthHeaders())
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

    changeStatusSent(order, refid): Observable<any> {
        return this.http.post(this.server.url + 'api/sentitem/', {
            orderid: order.orderid,
            itemid: order.itemid,
            refid: refid
        }, this.server.AuthHeaders())
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error));
    }

    adminChangeStatusReject(order, remark): Observable<any> {
        return this.http.post(this.server.url + 'api/admincancelitem/', {
            orderid: order.orderid,
            itemid: order.itemid,
            remark: remark
        }, this.server.AuthHeaders())
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error));
    }

    changeStatusComplete(order): Observable<any> {
        return this.http.post(this.server.url + 'api/completeitem/', {
            orderid: order.orderid,
            itemid: order.itemid
        }, this.server.AuthHeaders())
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error));
    }

    changeStatusCancel(order): Observable<any> {
        return this.http.post(this.server.url + 'api/cancelitem/', {
            orderid: order.orderid,
            itemid: order.itemid
        }, this.server.AuthHeaders())
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error));
    }
}