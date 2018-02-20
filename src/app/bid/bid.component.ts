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
  nextDay: Date;
  startdate: string;
  enddate: string;
  starttime: string;
  endtime: string;
  // private myBirthday: any;
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
    // let nowDate = new Date();
    let diffDays = Math.abs((firstDate.getTime() - secondDate.getTime()) / (oneDay));
    // let diffNow = Math.abs((nowDate.getTime() - firstDate.getTime()) / (oneDay));
    if (diffDays > 1) {
      alert('ต้องไม่เกิน 24 ชั่วโมง');
      // alert('ต้องไม่ต่ำกว่าวันที่ปัจจุบันและไม่เกิน 24 ชั่วโมง');
    }
  }

  selectTab(name) {
    this.selectedTab = name;
  }

  addBid() {
    this.ACTION_BID = 'เพิ่ม';
    $(this.modalbid.nativeElement).modal('show');
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
    this.bidData.starttime = new Date(this.bidData.starttime);
    this.bidData.endtime = new Date(this.bidData.endtime);
    console.log(this.bidData);
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
    if (this.ImgprdEdit.length == 0) {
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
        if (this.ACTION_BID === 'เพิ่ม') {
          this.addImgPrd.push(reader.result.replace(/\n/g, ''));
        } else {
          this.ImgprdEdit.push(reader.result.replace(/\n/g, ''));
        }

      };
    }
  }

  saveBid2() {
    console.log(this.bidData);
  }
  saveBid(e) {
    console.log(e);
    // this.pubsub.$pub('loading', true);
    // let sendBid: any = {};
    // let img: Array<any> = [];
    // console.log(this.bidData.starttime);
    // if (this.ACTION_BID === 'เพิ่ม') {
    //   if (this.isEditImage === true) {
    //     console.log(this.addImgPrd.length);
    //     for (let i = 0; i < this.addImgPrd.length; i++) {
    //       this.bidService.uploadImage(this.addImgPrd[i]).subscribe((upImg) => {
    //         img.push(upImg.imageURL);
    //         if (i === 0) {
    //           sendBid.image = img;
    //           sendBid.name = this.bidData.name;
    //           sendBid.startprice = this.bidData.startprice;
    //           sendBid.bidprice = this.bidData.bidprice;
    //           sendBid.detail = this.bidData.detail;
    //           sendBid.starttime = this.bidData.starttime;
    //           sendBid.endtime = this.bidData.endtime;
    //           this.bidService.saveBid(sendBid).subscribe((data) => {
    //             alert("เพิ่มการประมูลสินค้าเรียบร้อย");
    //             this.cancelAddBid();
    //             this.InitialData();
    //             $(this.modalbid.nativeElement).modal('hide');
    //           }, (err) => {
    //             alert("ไม่สามารถเพิ่มการประมูลสินค้าได้");
    //             console.log(err);
    //             this.pubsub.$pub('loading', false);
    //           });
    //         }
    //       }, (err) => {
    //         console.log(err);
    //       });
    //     }

    //   } else {
    //     alert("กรุณาเพิ่มรูปภาพการประมูล");
    //     this.pubsub.$pub('loading', false);
    //   }
    // } else if (this.ACTION_BID === 'แก้ไข') {
    //   if (this.isEditImage === true) {
    //     for (let i = 0; i < this.ImgprdEdit.length; i++) {
    //       this.bidService.uploadImage(this.ImgprdEdit[i]).subscribe((upImg) => {
    //         this.bidData.image.push(upImg.imageURL);
    //         if (i === 0) {
    //           sendBid._id = this.bidData._id;
    //           sendBid.image = this.bidData.image;
    //           sendBid.name = this.bidData.name;
    //           sendBid.startprice = this.bidData.startprice;
    //           sendBid.bidprice = this.bidData.bidprice;
    //           sendBid.detail = this.bidData.detail;
    //           sendBid.starttime = this.bidData.starttime;
    //           sendBid.endtime = this.bidData.endtime;
    //           this.bidService.editBid(sendBid).subscribe((data) => {
    //             alert("แก้ไขการประมูลสินค้าเรียบร้อย");
    //             this.cancelAddBid();
    //             this.InitialData();
    //             $(this.modalbid.nativeElement).modal('hide');
    //           }, (err) => {
    //             alert("ไม่สามารถแก้ไขการประมูลสินค้าได้");
    //             console.log(err);
    //             this.pubsub.$pub('loading', false);
    //           });
    //         }
    //       }, (err) => {
    //         console.log(err);
    //         this.pubsub.$pub('loading', false);
    //         alert("ไม่สามารถอัพโหลดรูปสินค้าประมูลได้ในขณะนี้ \nกรุณาลองใหม่อีกครั้ง");
    //       });
    //     }
    //   } else {
    //     sendBid._id = this.bidData._id;
    //     sendBid.image = this.addImgPrd;
    //     sendBid.name = this.bidData.name;
    //     sendBid.startprice = this.bidData.startprice;
    //     sendBid.bidprice = this.bidData.bidprice;
    //     sendBid.detail = this.bidData.detail;
    //     sendBid.starttime = this.bidData.starttime;
    //     sendBid.endtime = this.bidData.endtime;
    //     this.bidService.editBid(sendBid).subscribe((data) => {
    //       alert("แก้ไขการประมูลสินค้าเรียบร้อย");
    //       this.cancelAddBid();
    //       this.InitialData();
    //       $(this.modalbid.nativeElement).modal('hide');
    //     }, (err) => {
    //       alert("ไม่สามารถแก้ไขการประมูลสินค้าได้");
    //       console.log(err);
    //       this.pubsub.$pub('loading', false);
    //     });
    //   }
    // }
  }
}
