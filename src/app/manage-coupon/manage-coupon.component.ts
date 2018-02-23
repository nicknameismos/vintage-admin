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
  private users: any = [];
  private userList: Array<any> = [];
  // private couponlist: any;

  private couponTabs: any = {};
  private typeTab = 'กำลังใช้งาน';
  private selectedTab: number = 0;
  private currentPageSelected: number = 1;
  private searchKeyword: string = '';
  private pageSelect: number = 0;
  private curentPage: Array<any> = [];

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
        this.searchCoupon();
      }
    });
  }

  searchCoupon() {
    this.pubsub.$pub('loading', true);
    this.couponService.searchCoupon(this.typeTab, this.currentPageSelected, this.searchKeyword).subscribe(data => {
      this.couponTabs = data;
      console.log(this.couponTabs);
      this.curentPage[1] = 'active';

      this.pubsub.$pub('loading', false);
    }, err => {
      this.pubsub.$pub('loading', false);
      console.log(err);
    });
  }

  selectTab(titles) {
    this.currentPageSelected = 1;
    this.curentPage = [];
    this.curentPage[1] = 'active';
    this.typeTab = titles;
    this.searchCoupon();
  }

  pageing(page: number) {
    this.pubsub.$pub('loading', true);
    this.pageSelect = 0;
    this.curentPage = [];
    this.curentPage[page] = 'active';
    this.pageSelect = (page - 1) * 10;
    this.currentPageSelected = page;
    console.log(this.currentPageSelected);
    this.searchCoupon();
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

  // getCoupon() {
  //   this.pubsub.$pub('loading', true);
  //   this.couponService.getList().subscribe(resp => {
  //     this.couponlist = resp;
  //     console.log(this.couponlist);
  //     this.pubsub.$pub('loading', false);
  //   }, err => {
  //     this.pubsub.$pub('loading', false);
  //     console.log(err);
  //   });
  // }

  createCoupon() {
    // console.log('coupon');
    this.coupon.owner = this.users;
    this.pubsub.$pub('loading', true);
    this.couponService.createCoupon(this.coupon).subscribe(data => {
      // console.log(data);
      this.coupon = '';
      this.searchCoupon();
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
