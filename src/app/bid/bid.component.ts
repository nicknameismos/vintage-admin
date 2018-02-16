import { Component, OnInit, ViewChild } from '@angular/core';
import { ServerConfig } from 'app/provider/server.config';
import { Router } from '@angular/router';
import { PubSubService } from 'angular2-pubsub';
import { BidService } from 'app/bid/bid.service';
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

  calcDate(e) {
    let date = new Date(e);
    let curTime = new Date();
    let h = curTime.getHours() <= 9 ? '0' + curTime.getHours() : curTime.getHours();
    let m = curTime.getMinutes() <= 9 ? '0' + curTime.getMinutes() : curTime.getMinutes();
    let defaultTime = h + ':' + m + ':00';

    let timeStartSelected = this.bidData.starttime ? this.bidData.starttime + ':00' : defaultTime;
    let datetimeStartStr = this.bidData.startdate + 'T' + timeStartSelected;
    let dateTimeStartSelected = new Date(datetimeStartStr);

    let timeEndSelected = this.bidData.endtime ? this.bidData.endtime + ':00' : defaultTime;
    let datetimeEndStr = this.bidData.enddate ? this.bidData.enddate : this.bidData.startdate + 'T' + timeEndSelected;
    let dateTimeEndSelected = new Date(datetimeEndStr);

    let oneDay = 24 * 60 * 60 * 1000;
    let firstDate = new Date(dateTimeStartSelected);
    let secondDate = new Date(dateTimeEndSelected);
    let diffDays = Math.abs((firstDate.getTime() - secondDate.getTime()) / (oneDay));
    console.log(diffDays);
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
        if (this.ACTION_BID == 'เพิ่ม') {
          this.addImgPrd.push(reader.result.replace(/\n/g, ''));
        } else {
          this.ImgprdEdit.push(reader.result.replace(/\n/g, ''));
        }

      };
    }
  }
  saveBid() {
    this.pubsub.$pub('loading', true);
    let sendBid: any = {};
    let img: Array<any> = [];
    if (this.ACTION_BID === 'เพิ่ม') {
      if (this.isEditImage === true) {
        console.log(this.addImgPrd.length);
        for (let i = 0; i < this.addImgPrd.length; i++) {
          this.bidService.uploadImage(this.addImgPrd[i]).subscribe((upImg) => {
            img.push(upImg.imageURL);
            console.log(i);
            if (i === 0) {
              console.log(i);
              sendBid.image = img;

              sendBid.name = this.bidData.name;
              sendBid.startprice = this.bidData.startprice;
              sendBid.bidprice = this.bidData.bidprice;
              sendBid.detail = this.bidData.detail;
              sendBid.starttime = this.bidData.starttime;
              sendBid.endtime = this.bidData.endtime;
              console.log(sendBid);
              this.bidService.saveBid(sendBid).subscribe((data) => {
                alert("เพิ่มการประมูลสินค้าเรียบร้อย");
                this.cancelAddBid();
                this.InitialData();
                $(this.modalbid.nativeElement).modal('hide');
              }, (err) => {
                alert("ไม่สามารถเพิ่มการประมูลสินค้าได้");
                console.log(err);
                this.pubsub.$pub('loading', false);
              });
            }
          }, (err) => {
            console.log(err);
          });
        }

      } else {
        alert("กรุณาเพิ่มรูปภาพการประมูล");
        this.pubsub.$pub('loading', false);
      }
    } else if (this.ACTION_BID == 'แก้ไข') {
      if (this.isEditImage == true) {
        for (let i = 0; i < this.ImgprdEdit.length; i++) {
          this.bidService.uploadImage(this.ImgprdEdit[i]).subscribe((upImg) => {
            this.bidData.image.push(upImg.imageURL);
            console.log(i);
            if (i === 0) {
              console.log(i);
              sendBid._id = this.bidData._id;
              sendBid.image = this.bidData.image;
              sendBid.name = this.bidData.name;
              sendBid.startprice = this.bidData.startprice;
              sendBid.bidprice = this.bidData.bidprice;
              sendBid.detail = this.bidData.detail;
              sendBid.starttime = this.bidData.starttime;
              sendBid.endtime = this.bidData.endtime;
              console.log(sendBid);
              this.bidService.editBid(sendBid).subscribe((data) => {
                alert("แก้ไขการประมูลสินค้าเรียบร้อย");
                this.cancelAddBid();
                this.InitialData();
                $(this.modalbid.nativeElement).modal('hide');
              }, (err) => {
                alert("ไม่สามารถแก้ไขการประมูลสินค้าได้");
                console.log(err);
                this.pubsub.$pub('loading', false);
              });
            }
          }, (err) => {
            console.log(err);
            this.pubsub.$pub('loading', false);
            alert("ไม่สามารถอัพโหลดรูปสินค้าประมูลได้ในขณะนี้ \nกรุณาลองใหม่อีกครั้ง");
          });
        }
      } else {
        sendBid._id = this.bidData._id;
        sendBid.image = this.addImgPrd;
        sendBid.name = this.bidData.name;
        sendBid.startprice = this.bidData.startprice;
        sendBid.bidprice = this.bidData.bidprice;
        sendBid.detail = this.bidData.detail;
        sendBid.starttime = this.bidData.starttime;
        sendBid.endtime = this.bidData.endtime;
        this.bidService.editBid(sendBid).subscribe((data) => {
          alert("แก้ไขการประมูลสินค้าเรียบร้อย");
          this.cancelAddBid();
          this.InitialData();
          $(this.modalbid.nativeElement).modal('hide');
        }, (err) => {
          alert("ไม่สามารถแก้ไขการประมูลสินค้าได้");
          console.log(err);
          this.pubsub.$pub('loading', false);
        });
      }
    }
  }
}
