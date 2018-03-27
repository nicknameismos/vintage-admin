import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { of } from 'rxjs/observable/of';
import { ServerConfig } from 'app/provider/server.config';

@Injectable()
export class BidService {

    constructor(private http: Http, public server: ServerConfig) { }

    getBidList(data): Observable<any> {
        return this.http.post(this.server.url + 'api/bidlist', data, this.server.AuthHeaders())
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error));
    }

    saveBid(data): Observable<any> {
        return this.http.post(this.server.url + 'api/bids', data, this.server.AuthHeaders())
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error));
    }

    editBid(data): Observable<any> {
        return this.http.put(this.server.url + 'api/bids/' + data._id, data, this.server.AuthHeaders())
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error));
    }

    deleteBid(data): Observable<any> {
        return this.http.delete(this.server.url + 'api/bids/' + data._id, this.server.AuthHeaders())
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error));
    }

    uploadImage(image): Observable<any> {
        return this.http.post(this.server.url + 'api/products_picture', { data: image }, this.server.AuthHeaders())
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error));
    }

    getBid(): Observable<any> {
        return this.http.get(this.server.url + 'api/bids', this.server.AuthHeaders())
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error));
    }

    getShipingMaster(): Observable<any> {
        return this.http.get(this.server.url + 'api/shippingmasters', this.server.AuthHeaders())
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error));
    }
}
