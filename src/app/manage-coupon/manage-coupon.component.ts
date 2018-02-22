import { Component, OnInit } from '@angular/core';
import { ManageUserService } from 'app/manage-user/manage-user.service';
import { ServerConfig } from 'app/provider/server.config';
import { PubSubService } from 'angular2-pubsub';
import { Router } from '@angular/router';
import { ManageCouponService } from 'app/manage-coupon/manage-coupon.service';

@Component({
  selector: 'app-manage-coupon',
  templateUrl: './manage-coupon.component.html',
  styleUrls: ['./manage-coupon.component.scss']
})
export class ManageCouponComponent implements OnInit {
  private coupon: any = {};
  private listAllUser: Array<any> = [];
  private listUsercustomer: Array<any> = [];
  private listUseradmin: Array<any> = [];
  private listUsershopowner: Array<any> = [];

  private user: Array<any> = [];
  // private selectList: Array<any> = [];
  // private userSelected: Array<any> = [];
  private users: any = [];
  // private checkeds: Array<any> = [];
  private userList: Array<any> = [];
  private couponlist: any;


  constructor(
    private UserService: ManageUserService,
    private server: ServerConfig,
    private pubsub: PubSubService,
    private router: Router,
    private couponService: ManageCouponService
  ) { }

  ngOnInit() {
    this.pubsub.$pub('loading', true);
    this.server.isLogin().subscribe(data => {
      if (!data) {
        this.router.navigate(['/login']);
        this.pubsub.$pub('loading', false);
      } else {
        this.getUser();
        this.getCoupon();
      }
    });
  }

  getUser() {
    // this.user = [];
    this.UserService.getUser().subscribe(jso => {
      this.listAllUser = jso.filterrole;
      this.listUsercustomer = [];
      this.listUseradmin = [];
      this.listUsershopowner = [];

      this.listAllUser.forEach(element => {
        if (element.name === 'customer') {
          element.users.forEach(user => {
            this.listUsercustomer.push(user);
          });
        } else if (element.name === 'shopowner') {
          element.users.forEach(user => {
            this.listUsershopowner.push(user);
          });
        } else if (element.name === 'admin') {
          element.users.forEach(user => {
            this.listUseradmin.push(user);
          });
        }
      });

      this.user = this.listUsercustomer.concat(this.listUseradmin, this.listUsershopowner);
      console.log(this.user);
      this.pubsub.$pub('loading', false);
    }, err => {
      console.log(err);
      this.pubsub.$pub('loading', false);
    });

  }

  getCoupon() {
    this.pubsub.$pub('loading', true);
    this.couponService.getList().subscribe(resp => {
      this.couponlist = resp;
      console.log(this.couponlist);
      this.pubsub.$pub('loading', false);
    }, err => {
      this.pubsub.$pub('loading', false);
      console.log(err);
    });
  }

  createCoupon() {
    // console.log('coupon');
    this.coupon.owner = this.users;
    this.pubsub.$pub('loading', true);
    this.couponService.createCoupon(this.coupon).subscribe(data => {
      // console.log(data);
      this.coupon = '';
      this.getCoupon();
      this.pubsub.$pub('loading', false);
    }, err => {
      this.pubsub.$pub('loading', false);
      console.log(err);
    });
  }

  cancel() {
    this.coupon = '';
    this.userList = [];
  }

  selectUser(user_id, user_dis) {
    if (this.users.indexOf(user_id) !== -1) {
      // console.log(this.users.indexOf(user_id));
      let index = this.users.indexOf(user_id);
      this.users.splice(index, 1);
      this.userList.splice(index, 1);
    } else {
      this.users.push(user_id);
      this.userList.push(user_dis);
    }
    // console.log(this.userList);
  }

}
