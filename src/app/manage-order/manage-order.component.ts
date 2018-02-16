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
    this.manageOrderService.searchOrder(this.typeTab, this.currentPageSelected, this.searchKeyword).subscribe(data => {
      this.OrderList = data;
      // this.OrderList.items = data.items;
      // this.OrderList.pagings = data.paging;
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
    // alert(this.currentPageSelected)
    this.searchOrder();
  }

  pageing(page: number) {
    this.pubsub.$pub('loading', true);
    this.pageSelect = 0;
    this.curentPage = [];
    this.curentPage[page] = 'active';
    this.pageSelect = (page - 1) * 10;
    this.currentPageSelected = page;
    this.searchOrder();
  }

  onClickDetail(item) {
    this.pubsub.$pub('loading', true);
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
    this.manageOrderService.changeStatusRefund(this.OrderDetail).subscribe(data => {
      alert('sss');
      this.searchOrder();
    }, err => {
      console.log(err);
    });
  }

  transferitm() {
    this.manageOrderService.changeStatusTransfer(this.OrderDetail).subscribe(data => {
      alert('sxxss');
      this.searchOrder();
    }, err => {
      console.log(err);
    });
  }
}
