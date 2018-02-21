import { Component, OnInit, ViewChild } from '@angular/core';
import { ServerConfig } from 'app/provider/server.config';
import { Router } from '@angular/router';
import { PubSubService } from 'angular2-pubsub';
import { BidService } from 'app/bid/bid.service';
import { MomentModule } from 'angular2-moment';
declare let $: any;

@Component({
  selector: 'app-bid',
  templateUrl: './bid.component.html',
  styleUrls: ['./bid.component.scss']
})
export class BidComponent implements OnInit {
  @ViewChild('modalbid') modalbid;
  @ViewChild('prdimgInput') prdimgInput;
  private ACTION_BID: string;
  private addImgPrd: Array<string> = [];
  private ImgprdEdit: Array<string> = [];
  private isEditImage: boolean = false;
  private bidData: any = {};
  private bidlist: Array<any> = [];
  private selectedTab: string = 'กำลังประมูล';
  private oldDate: any = {};
  private shippingMaster: Array<any> = [];
  private shippingMasterOld: Array<any> = [];
  private shippings: Array<any> = [];
  constructor(private server: ServerConfig, private router: Router, private pubsub: PubSubService, private bidService: BidService) { }

  ngOnInit() {
    this.server.isLogin().subscribe(data => {
      if (!data) {
        this.router.navigate(['/login']);
      } else {
        this.pubsub.$pub('loading', true);
        this.InitialData();
      }
    });
  }
  InitialData() {
    this.bidService.getBid().subscribe((data) => {
      this.bidlist = data;
      this.pubsub.$pub('loading', false);
    });
    this.bidService.getShipingMaster().subscribe(data => {
      this.shippingMaster = data;
      this.shippingMasterOld = data;
      console.log(this.shippingMaster);
    }, err => {
      console.log(err);
      alert('ไม่สามารถโหลดข้อมูล Shipping Master ได้');
    });
  }

  calcDate(_type) {
    let date = new Date(this.bidData.starttime);
    let _month = date.getMonth() <= 9 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1;
    let _date = date.getDate() <= 9 ? '0' + date.getDate() : date.getDate();
    let _incHr = (date.getHours() + 1) <= 9 ? '0' + (date.getHours() + 1) : (date.getHours() + 1);
    let _incMin = date.getMinutes() <= 9 ? '0' + date.getMinutes() : date.getMinutes();
    let defaultDate = date.getFullYear() + '-' + _month + '-' + _date + 'T' + _incHr + ':' + _incMin;
    this.bidData.endtime = _type === 'end' ? this.bidData.endtime : defaultDate;
    let oneDay = 24 * 60 * 60 * 1000;
    let firstDate = new Date(this.bidData.starttime);
    let secondDate = new Date(this.bidData.endtime);
    let diffDays = Math.abs((firstDate.getTime() - secondDate.getTime()) / (oneDay));
    if (diffDays > 1) {
      this.bidData.starttime = '';
      this.bidData.endtime = '';
      setTimeout(() => {
        this.bidData.starttime = this.oldDate.starttime;
        this.bidData.endtime = this.oldDate.endtime;
      }, 50);
      alert('ต้องไม่เกิน 24 ชั่วโมง');
    } else {
      this.oldDate = {
        starttime: this.bidData.starttime,
        endtime: this.bidData.starttime
      };
    }
  }

  selectShipping(item) {
    let index = this.shippings.findIndex(i => i._id === item._id);
    if (index === -1) {
      this.shippings.push(item);
    } else {
      for (let i = 0; i < this.shippings.length; i++) {
        if (this.shippings[i]._id === item._id) {
          this.shippings.splice(i, 1);
          break;
        }
      }
    }
  }

  setShippingPrice(id, e) {
    let price = parseFloat(e.target.value);
    for (let i = 0; i < this.shippings.length; i++) {
      if (this.shippings[i]._id === id) {
        this.shippings[i].price = price ? price : 0;
      }
    }
  }

  selectTab(name) {
    this.selectedTab = name;
  }

  addBid() {
    this.ACTION_BID = 'เพิ่ม';
    this.shippings = [];
    this.shippingMaster = this.shippingMasterOld;
    $(this.modalbid.nativeElement).modal('show');
    let date = new Date();
    let _month = date.getMonth() <= 9 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1;
    let _date = date.getDate() <= 9 ? '0' + date.getDate() : date.getDate();
    let _incHr = date.getHours() <= 9 ? '0' + date.getHours() : date.getHours();
    let _incMin = date.getMinutes() <= 9 ? '0' + date.getMinutes() : date.getMinutes();
    let defaultDate = date.getFullYear() + '-' + _month + '-' + _date + 'T' + _incHr + ':' + _incMin;
    this.bidData.starttime = defaultDate;
    this.bidData.endtime = defaultDate;
    this.oldDate = {
      starttime: this.bidData.starttime,
      endtime: this.bidData.starttime
    };
  }
  cancelAddBid() {
    $(this.modalbid.nativeElement).modal('hide');
    this.addImgPrd = [];
    this.ImgprdEdit = [];
    this.bidData = {};
  }

  editBid(item) {
    this.ACTION_BID = 'แก้ไข';
    this.bidData = JSON.parse(JSON.stringify(item));
    this.addImgPrd = this.bidData.image;
    for (let i = 0; i < this.shippingMaster.length; i++) {
      for (let j = 0; j < this.bidData.shippings.length; j++) {
        if (this.shippingMaster[i]._id === this.bidData.shippings[j].ref._id) {
          this.shippingMaster[i].isChecked = true;
        }
      }
    }

    setTimeout(() => {
      let shippings: Array<any> = [];
      this.bidData.shippings.forEach((e, i) => {
        shippings.push({
          _id: e.ref._id,
          price: e.price,
          name: e.ref.name,
          detail: e.ref.detail,
          isChecked: true
        });
      });
      this.shippings = shippings;
    }, 100);
    this.bidData.starttime = this.bidData.starttime.replace(':00.000Z', '');
    this.bidData.endtime = this.bidData.endtime.replace(':00.000Z', '');
    $(this.modalbid.nativeElement).modal('show');
  }

  deleteBid(item) {
    const cfDelete = confirm('ยืนยันการลบการประมูลนี้');
    if (cfDelete) {
      this.pubsub.$pub('loading', true);
      this.bidService.deleteBid(item).subscribe(data => {
        this.InitialData();
      }, err => {
        console.log(err);
      });
    }
  }

  upImgPrd() {
    this.prdimgInput.nativeElement.click();
  }
  removeprdImg(index) {
    this.addImgPrd.splice(index, 1);
    if (this.addImgPrd.length == 0) {
      this.isEditImage = false;
    }
  }

  removeprdImgEDIT(index) {
    this.ImgprdEdit.splice(index, 1);
    if (this.ImgprdEdit.length === 0) {
      this.isEditImage = false;
    }
  }


  onupImgPrdChange($event) {
    const fileBrowser = this.prdimgInput.nativeElement;
    const reader = new FileReader();
    reader.readAsDataURL(fileBrowser.files[0]);
    if (fileBrowser.files.length > 0) {
      reader.onload = () => {
        this.isEditImage = true;
        let result = reader.result.replace(/\n/g, '');
        if (this.ACTION_BID === 'เพิ่ม') {
          this.addImgPrd.push(result);
        } else if (this.ACTION_BID === 'แก้ไข') {
          this.ImgprdEdit.push(result);
        }
      };
    }
  }

  saveBid() {
    this.pubsub.$pub('loading', true);
    let refShippings: Array<any> = [];
    this.shippings.forEach((e, i) => {
      refShippings.push({
        ref: {
          _id: e._id,
        },
        price: e.price
      });
    });
    this.bidData.shippings = refShippings;
    if (this.ACTION_BID === 'เพิ่ม') {
      let image: Array<any> = [];
      let countUpload: any = 0;
      for (let i = 0; i < this.addImgPrd.length; i++) {
        this.bidService.uploadImage(this.addImgPrd[i]).subscribe(data => {
          countUpload += 1;
          image.push(data.imageURL);
          if (countUpload === this.addImgPrd.length) {
            this.bidData.image = image;
            this.bidService.saveBid(this.bidData).subscribe(res => {
              this.pubsub.$pub('loading', false);
              alert('เพิ่มการประมูลเรียบร้อยแล้ว');
              window.location.reload();
            }, errRes => {
              console.log(errRes);
              this.pubsub.$pub('loading', false);
              alert('ไม่สามารถเพิ่มการประมูลได้');
            });
          }
        }, err => {
          console.log(err);
          this.pubsub.$pub('loading', false);
          alert('ไม่สามารถอัพโหลดรูปได้');
        });
      }
    } else if (this.ACTION_BID === 'แก้ไข') {
      this.bidService.editBid(this.bidData).subscribe(data => {
        this.pubsub.$pub('loading', false);
        alert('แก้ไขข้อมูลเรียบร้อย');
        $(this.modalbid.nativeElement).modal('hide');
        window.location.reload();
      }, err => {
        console.log(err);
        this.pubsub.$pub('loading', false);
        alert('ไม่สามารถแก้ไขข้อมูลได้');
      });
    }
  }
}
