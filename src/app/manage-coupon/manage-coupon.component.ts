import { Component, OnInit } from '@angular/core';
import { ManageUserService } from 'app/manage-user/manage-user.service';
import { ServerConfig } from 'app/provider/server.config';
import { PubSubService } from 'angular2-pubsub';
import { Router } from '@angular/router';

@Component({
  selector: 'app-manage-coupon',
  templateUrl: './manage-coupon.component.html',
  styleUrls: ['./manage-coupon.component.scss']
})
export class ManageCouponComponent implements OnInit {
  private coupon: any = {};
  private listAllUser: Array<any> = [];
  private listUser: Array<any> = [];

  constructor(
    private UserService: ManageUserService,
    private server: ServerConfig,
    private pubsub: PubSubService,
    private router: Router
  ) { }

  ngOnInit() {
    this.pubsub.$pub('loading', true);
    this.server.isLogin().subscribe(data => {
      if (!data) {
        this.router.navigate(['/login']);
        this.pubsub.$pub('loading', false);
      } else {
        this.getUser();
      }
    });
  }

  getUser() {
    this.UserService.getUser().subscribe(jso => {
      this.listAllUser = jso.filterrole;
      this.listUser = [];
      this.listAllUser.forEach(element => {
        if (element.name === 'customer') {
          this.listUser.push(element.users);
        } else if (element.name === 'shopowner') {
          this.listUser.push(element.users);
        } else if (element.name === 'admin') {
          this.listUser.push(element.users);
        }
      });
      console.log(this.listUser);
      this.pubsub.$pub('loading', false);
    }, err => {
      console.log(err);
      this.pubsub.$pub('loading', false);
    });

  }

  createCoupon() {
    console.log('coupon');
  }
  cancel() {
    this.coupon = '';
  }

}
