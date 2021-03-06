import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { ManageUserService } from 'app/manage-user/manage-user.service';
import { ServerConfig } from 'app/provider/server.config';
import { Router } from '@angular/router';
import { PubSubService } from 'angular2-pubsub';
import { FormBuilder, FormGroup, Validators, FormControl, FormArray } from '@angular/forms';
declare let $: any;
@Component({
  selector: 'app-manage-user',
  templateUrl: './manage-user.component.html',
  styleUrls: ['./manage-user.component.scss']
})
export class ManageUserComponent implements OnInit {
  @ViewChild('dissmissBtn2') dissmissBtn2;
  @ViewChild('modalEditUser') modalEditUser;
  loading: boolean = true;
  private listAllUser: Array<any> = [];
  private listCust: Array<any> = [];
  private listShopOwner: Array<any> = [];
  private listAdmin: Array<any> = [];
  private listBiker: Array<any> = [];
  private editingUserData: any = {};
  private tabType: string = 'customer';
  private action: string = '';

  private userList: any = {};
  private typeTab = 'ลูกค้า';
  private searchKeyword: string = '';
  private currentPageSelected: number = 1;
  private curentPage: Array<any> = [];
  private pageSelect: number = 0;
  private selectedTab: number = 0;


  constructor(private UserService: ManageUserService, private server: ServerConfig, private router: Router, private pubsub: PubSubService) {
  }

  ngOnInit() {
    this.pubsub.$pub('loading', true);
    this.server.isLogin().subscribe(data => {
      if (!data) {
        this.router.navigate(['/login']);
        this.pubsub.$pub('loading', false);
      } else {
        // this.getAllUser();
        this.searchUser();
      }
    });
  }

  searchUser() {
    this.pubsub.$pub('loading', true);
    this.UserService.searchUser(this.typeTab, this.currentPageSelected, this.searchKeyword).subscribe(data => {
      this.userList = data;
      if (this.currentPageSelected === 1) {
        this.curentPage[1] = 'active';
      }
      console.log(this.userList);
      this.pubsub.$pub('loading', false);
    }, err => {
      this.pubsub.$pub('loading', false);

      console.log(err);
    });
  }

  selectTab(titles) {
    this.pageSelect = 0;
    this.currentPageSelected = 1;
    this.curentPage = [];
    this.curentPage[1] = 'active';
    this.typeTab = titles;
    this.searchUser();
  }

  pageing(page: number) {
    this.pubsub.$pub('loading', true);
    this.pageSelect = 0;
    this.curentPage = [];
    this.curentPage[page] = 'active';
    this.pageSelect = (page - 1) * 10;
    this.currentPageSelected = page;
    console.log(this.currentPageSelected);
    this.searchUser();
  }

  pageingN() {

    let usrlist = JSON.parse(JSON.stringify(this.userList));
    if (this.currentPageSelected === 0) {
      this.currentPageSelected = 1;
    }
    this.currentPageSelected++;
    if (usrlist.paging.length >= this.currentPageSelected) {
      this.pubsub.$pub('loading', true);
      this.pageSelect = 0;
      this.curentPage = [];
      this.pageSelect = (this.currentPageSelected - 1) * 10;
      this.curentPage[this.currentPageSelected] = 'active';
      this.searchUser();
    } else {
      this.currentPageSelected--;
    }
  }

  pageingP() {
    let oldpage = this.currentPageSelected;
    let usrlist = JSON.parse(JSON.stringify(this.userList));
    if (this.currentPageSelected > 1) {
      this.currentPageSelected--;
    }
    console.log(this.currentPageSelected);
    if (usrlist.paging.length >= this.currentPageSelected && this.currentPageSelected > 0 && this.currentPageSelected !== oldpage) {
      this.pubsub.$pub('loading', true);
      this.pageSelect = 0;
      this.curentPage = [];
      this.pageSelect = (this.currentPageSelected - 1) * 10;
      this.curentPage[this.currentPageSelected] = 'active';
      this.searchUser();
    }
  }

  getAllUser() {

    this.UserService.getUser().subscribe(jso => {
      this.listAllUser = jso.filterrole;
      this.listCust = [];
      this.listShopOwner = [];
      this.listAdmin = [];
      this.listBiker = [];
      this.listAllUser.forEach(element => {
        if (element.name === 'customer') {
          this.listCust.push(element.users);
        } else if (element.name === 'shopowner') {
          this.listShopOwner.push(element.users);
        } else if (element.name === 'admin') {
          this.listAdmin.push(element.users);
        } else if (element.name === 'biker') {
          this.listBiker.push(element.users);
        }

      });
      this.pubsub.$pub('loading', false);
    }, err => {
      this.pubsub.$pub('loading', false);
      const msgERR = JSON.parse(err._body);
      if (msgERR.message === 'Token is incorrect or has expired. Please login again') {
        alert('หมดระยะเวลาการเชื่อมต่อกับระบบบริหารร้านค้า \nกรุณาเข้าสู่ระบบใหม่อีกครั้ง');
        window.localStorage.clear();
      }
    });
  }

  deleteUser() {
    const r = confirm('ยืนยันการลบข้อมูล');
    if (r) {
      this.UserService.delete(this.editingUserData._id).subscribe(data => {
        console.log(data);
        alert('ลบข้อมูลสำเร็จ');
        this.searchUser();
        this.dissmissBtn2.nativeElement.click();
      }, err => {
        console.log(err);
      });
    }
  }

  addUser() {
    this.editingUserData = {};
    this.action = 'เพิ่มบัญชีผู้ใช้';
    $(this.modalEditUser.nativeElement).modal('show');
  }

  editUser(item) {
    let selection = window.getSelection();
    if (selection.toString().length === 0) {
      $(this.modalEditUser.nativeElement).modal('show');
      this.action = 'แก้ไขบัญชีผู้ใช้';
      this.editingUserData = item;
    }
  }

  saveUser() {
    this.pubsub.$pub('loading', true);
    if (this.action === 'แก้ไขบัญชีผู้ใช้') {
      this.UserService.edit(this.editingUserData).subscribe(data => {
        this.searchUser();
        alert('บันทึกข้อมูลสำเร็จ');
        this.dissmissBtn2.nativeElement.click();
      }, err => {
        console.log(err);
      });
    } else {
      this.editingUserData.username = this.editingUserData.email;
      this.UserService.add(this.editingUserData).subscribe(data => {
        alert('บันทึกข้อมูลสำเร็จ');
        this.searchUser();
        this.dissmissBtn2.nativeElement.click();
      }, err => {
        console.log(err);
      });
    }
  }

  activeTab(tabType) {
    this.tabType = tabType;
  }

  validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email.toLowerCase());
  }
}
