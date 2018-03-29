import { Router } from '@angular/router';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ServerConfig } from 'app/provider/server.config';
import { PubSubService } from 'angular2-pubsub';
import { ManageOrderService } from 'app/manage-order/manage-order.service';
import { ItemStatusModel } from 'app/manage-order/manage-order.model';

@Component({
  selector: 'app-manage-order',
  templateUrl: './manage-order.component.html',
  styleUrls: ['./manage-order.component.scss']
})
export class ManageOrderComponent implements OnInit {
  loading: boolean = true;
  private OrderList: any = {};
  public OrderDetail: ItemStatusModel = new ItemStatusModel();
  private typeTab = 'รอชำระเงิน';
  private currentPageSelected: number = 1;
  private searchKeyword: string = '';
  private pageSelect: number = 0;
  private selectedTab: number = 0;
  private curentPage: Array<any> = [];
  private dateShow: any;
  private statusdate: string = '';
  public refid: '';
  public remark: '';
  private shipping: any = {
    address: {}
  };
  private adminshipping: any = {
    ref: {
      name: ''
    },
    price: 0
  };
  @ViewChild('modalDetail') modalDetail;
  constructor(
    private pubsub: PubSubService,
    private server: ServerConfig,
    private router: Router,
    public manageOrderService: ManageOrderService
  ) { }

  ngOnInit() {
    this.server.isLogin().subscribe(data => {
      if (!data) {
        this.router.navigate(['/login']);
        this.loading = false;
      } else {
        // this.pubsub.$pub('loading', true);
        this.searchOrder();
      }
    });
  }
  searchOrder() {
    this.pubsub.$pub('loading', true);
    this.refid = '';
    this.remark = '';
    // this.shipping = {};
    this.manageOrderService.searchOrder(this.typeTab, this.currentPageSelected, this.searchKeyword).subscribe(data => {
      this.OrderList = data;
      if (this.currentPageSelected === 1) {
        this.curentPage[1] = 'active';
      }
      console.log(this.OrderList);
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
    this.searchOrder();
  }

  pageing(page: number) {
    this.pubsub.$pub('loading', true);
    this.pageSelect = 0;
    this.curentPage = [];
    this.curentPage[page] = 'active';
    this.pageSelect = (page - 1) * 10;
    this.currentPageSelected = page;
    console.log(this.currentPageSelected);
    this.searchOrder();
  }

  pageingN() {

    let orderlist = JSON.parse(JSON.stringify(this.OrderList));
    if (this.currentPageSelected === 0) {
      this.currentPageSelected = 1;
    }
    this.currentPageSelected++;
    if (orderlist.paging.length >= this.currentPageSelected) {
      this.pubsub.$pub('loading', true);
      this.pageSelect = 0;
      this.curentPage = [];
      this.pageSelect = (this.currentPageSelected - 1) * 10;
      this.curentPage[this.currentPageSelected] = 'active';
      this.searchOrder();
    }
  }

  pageingP() {
    let oldpage = this.currentPageSelected;
    let orderlist = JSON.parse(JSON.stringify(this.OrderList));
    if (this.currentPageSelected > 1) {
      this.currentPageSelected--;
    }
    console.log(this.currentPageSelected);
    if (orderlist.paging.length >= this.currentPageSelected && this.currentPageSelected > 0 && this.currentPageSelected !== oldpage) {
      this.pubsub.$pub('loading', true);
      this.pageSelect = 0;
      this.curentPage = [];
      this.pageSelect = (this.currentPageSelected - 1) * 10;
      this.curentPage[this.currentPageSelected] = 'active';
      this.searchOrder();
    }
  }

  onClickDetail(item) {
    this.pubsub.$pub('loading', true);
    this.adminshipping = {};
    this.manageOrderService.orderDetail(item.orderid, item.itemid).subscribe(data => {
      // console.log(data);
      this.OrderDetail = data;
      console.log(this.OrderDetail);
      if (this.OrderDetail.status === 'confirm') {
        this.dateShow = this.OrderDetail.confirmdate;
        this.statusdate = 'วันที่สั่งซื้อ';
      } else if (this.OrderDetail.status === 'sent') {
        this.dateShow = this.OrderDetail.sentdate;
        this.statusdate = 'วันที่ส่ง';
      } else if (this.OrderDetail.status === 'completed') {
        this.dateShow = this.OrderDetail.receiveddate;
        this.statusdate = 'วันที่สำเร็จ';
      } else if (this.OrderDetail.status === 'cancel') {
        this.dateShow = this.OrderDetail.canceldate;
        this.statusdate = 'วันที่ยกเลิก';
      } else if (this.OrderDetail.status === 'reject') {
        this.dateShow = this.OrderDetail.canceldate;
        this.statusdate = 'วันที่ปฏิเสธ';
      } else if (this.OrderDetail.status === 'transferred') {
        this.dateShow = this.OrderDetail.transferdate;
        this.statusdate = 'วันที่ชำระเงิน';
      } else if (this.OrderDetail.status === 'rejectrefund' || this.OrderDetail.status === 'cancelrefund') {
        this.dateShow = this.OrderDetail.refunddate;
        this.statusdate = 'วันที่คืนเงิน';
      }
      this.pubsub.$pub('loading', false);
    }, err => {
      this.pubsub.$pub('loading', false);
      console.log(err);
    });
  }

  refunditm() {
    const cfrefund = confirm('ยืนยันการคืนเงินให้ลูกค้า');
    if (cfrefund) {
      this.manageOrderService.changeStatusRefund(this.OrderDetail).subscribe(data => {
        alert('คืนเงินให้ลูกค้าสำเร็จ');
        this.searchOrder();
      }, err => {
        console.log(err);
      });
    }
  }

  confirmitm() {
    const cfconfirm = confirm('ยืนยันการชำระเงิน');
    if (cfconfirm) {
      // console.log(this.adminshipping);
      this.manageOrderService.adminStatusConfirm(this.OrderDetail, this.shipping, this.adminshipping).subscribe(data => {
        this.modalDetail.nativeElement.click();
        alert('ชำระเงินเรียบร้อยแล้ว');
        // console.log(data);
        this.searchOrder();
      }, err => {
        this.modalDetail.nativeElement.click();
        console.log(err);
      });
    }
  }

  transferitm() {
    const cftransfer = confirm('ยืนยันการจ่ายเงินให้ร้านค้า');
    if (cftransfer) {
      this.manageOrderService.changeStatusTransfer(this.OrderDetail).subscribe(data => {
        alert('จ่ายเงินให้ร้านค้าสำเร็จ');
        this.searchOrder();
      }, err => {
        console.log(err);
      });
    }

  }

  sentitm(refid) {
    this.refid = refid;
    const cfsent = confirm('ยืนยันการจัดส่ง');
    if (cfsent) {
      this.manageOrderService.changeStatusSent(this.OrderDetail, this.refid).subscribe(data => {
        this.modalDetail.nativeElement.click();
        alert('จัดส่งสำเร็จ');
        // console.log(data);
        this.searchOrder();
      }, err => {
        this.modalDetail.nativeElement.click();
        console.log(err);
      });
    }

  }

  adminCancelitm(remark) {
    this.remark = remark;
    const cfcancel = confirm('ยืนยันการยกเลิกคำสั่งซื้อ');
    if (cfcancel) {
      this.manageOrderService.adminChangeStatusReject(this.OrderDetail, this.remark).subscribe(data => {
        this.modalDetail.nativeElement.click();
        alert('ยกเลิกคำสั่งซื้อสำเร็จ');
        // console.log(data);
        this.searchOrder();
      }, err => {
        this.modalDetail.nativeElement.click();
        console.log(err);
      });
    }

  }

  completeitm() {
    const cfcomplete = confirm('ยืนยันการรับสินค้า');
    if (cfcomplete) {
      this.manageOrderService.changeStatusComplete(this.OrderDetail).subscribe(data => {
        alert('คำสั่งซื้อสำเร็จ');
        this.searchOrder();
      }, err => {
        console.log(err);
      });
    }

  }

  //   ok() {
  //     const cfok = confirm('ยืนยันการจัดส่ง');
  //     alert('OK!');
  //   }

  //   cancel(remark) {
  //     this.remark = remark;
  //     const cfcancel = confirm('ยืนยันการลบร้านค้า');
  //     this.modalDetail.nativeElement.click();
  //     console.log(this.remark);
  //     alert('Cancel!');
  //   }
}
